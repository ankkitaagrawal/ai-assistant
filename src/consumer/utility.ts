import { Channel } from '../config/rabbitmq';
import logger from "../service/logger";
import producer from '../config/producer';
import rtlayer from '../config/rtlayer';
import { EventSchema } from '../type/event';
import { generateThreadName } from '../service/thread';
import ThreadService from '../dbservices/thread';
import { updateDiary } from '../service/diary';
import AgentService from '../dbservices/agent';
import { v4 as uuidv4 } from 'uuid';
import { AgentSchema, DiaryPage } from '../type/agent';
import env from '../config/env';
import { AIMiddlewareBuilder } from '../utility/aimiddleware';


const QUEUE_NAME = process.env.UTILITY_QUEUE || 'assistant-utility';
async function processMsg(message: any, channel: Channel) {
    try {
        const msg = JSON.parse(message.content.toString());
        const { event, data } = EventSchema.parse(msg);
        switch (event) {
            case 'generate-thread-name':
                {
                    const name = await generateThreadName(data.threadId, data.message, data.response);
                    if (!name) break;
                    // Update the thread name in the database
                    await ThreadService.updateThreadName(data.threadId, name);
                    // Send the thread name to the UI
                    rtlayer.message(JSON.stringify({ name: name }), {
                        channel: data.threadId
                    });
                    break;
                }
            case 'update-diary':
                {
                    const agent = await AgentService.getAgentById(data.agentId);
                    const pageId = data.pageId;
                    const page = pageId ? (agent?.diary as any)?.[pageId] : { heading: data.heading, content: "" };
                    const response = await updateDiary(data.message, page?.heading || "", page?.content);
                    let updatedAgent = await AgentService.updateAgentDiary(data.agentId, {
                        privacy: data.privacy,
                        content: response.content,
                        id: data.pageId,
                        heading: page?.heading
                    });

                    break;
                }
            case 'fallback':
                {
                    const recentFallbackThreads = (await ThreadService.getFallbackThreads(data.agentId).catch(error => [])).slice(-20);
                    const threadSelectorModel = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY).useBridge("677ce86bd09d11043dbc8de9").useOpenAI("gpt-4-turbo").build();
                    let selectedThreadId = await threadSelectorModel.sendMessage(`Select the most relevant thread for message "${data.message}" from the following list: ${recentFallbackThreads.map((thread) => `${thread._id?.toString()} | ${thread.name}`).join(", ")}`);
                    const agent = await AgentService.getAgentById(data.agentId);
                    if (!recentFallbackThreads?.some((thread) => thread._id?.toString() == selectedThreadId)) {
                        // Create a new thread for owner to answer this query
                        const threadName = await generateThreadName(data.threadId, data.message, `Generate thread name for message "${data.message}"`);
                        const thread = await ThreadService.createThread({ createdBy: agent.createdBy, name: threadName, middleware_id: uuidv4(), agent: data.agentId, type: 'fallback' });
                        selectedThreadId = thread._id?.toString();
                    }
                    // Update the diary
                    const threadDiary = getThreadDiary(agent?.diary, data.threadId);
                    const diaryModel = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY).useBridge("67820feb25ab50089db7273b").useOpenAI("gpt-4o").build();
                    const variables = {
                        "content": threadDiary?.content,
                        "threadId": data?.threadId,
                        "userId": data?.userId
                    }
                    const newPageContent = await diaryModel.sendMessage(`Message from User: ${data.message} ;with userId  (${data?.userId}) , threadId (${data?.threadId}) `, undefined, variables);
                    let updatedAgent = await AgentService.updateAgentDiary(data.agentId, {
                        privacy: "thread",
                        content: newPageContent,
                        id: data.threadId,
                        heading: `Thread: ${data.threadId}`
                    });
                    // Send message to owner
                    const agentModel = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY).useBridge(agent.bridgeId).build();
                    await agentModel.createMessage(selectedThreadId, data.message);
                    break;
                }
            case 'message':
                {
                    const agent = await AgentService.getAgentById(data.from);
                    const thread = await ThreadService.getThreadById(data.to);
                    if (!thread) {
                        logger.error(`[message] Thread not found: ${data.to}`);
                        throw new Error(`Thread not found: ${data.to}`);
                    }
                    // Update diary
                    const threadDiary = getThreadDiary(agent.diary, data.to);
                    if (!threadDiary) throw new Error("Thread diary is not found");
                    const diaryModel = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY).useBridge("67820feb25ab50089db7273b").useOpenAI("gpt-4-turbo").build();
                    const newPageContent = await diaryModel.sendMessage(`Message from Owner: ${data.message}`);
                    let updatedAgent = await AgentService.updateAgentDiary(data.from, {
                        privacy: "thread",
                        content: newPageContent,
                        id: threadDiary.id
                    });

                    // Create message in user thread
                    const agentModel = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY).useBridge(agent.bridgeId).build();
                    await agentModel.createMessage(data.to, data.message);
                    break;
                }

            default:
                logger.error(`[message] Unknown event type: ${event}`);
                throw new Error(`Unknown event type: ${event}`);
                break;
        }
        channel.ack(message);
    } catch (error: any) {
        console.log(error);
        // TODO: Add error message to the failed message
        producer.publishToQueue(QUEUE_NAME + "_FAILED", message.content.toString());
        logger.error(`[message] Error processing message: ${error.message}`);
        channel.ack(message);
    }

}

export default {
    queue: QUEUE_NAME,
    processor: processMsg,
    batch: 1
}

function getThreadDiary(diary?: any, threadId?: string) {
    let threadDiary = null;
    if (!diary) return null;
    for (const pageId in diary) {
        const page = (diary as any)?.[pageId] as DiaryPage;
        if (pageId == threadId) threadDiary = page;
    }
    return threadDiary;
}