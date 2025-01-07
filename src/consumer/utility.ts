import { Channel } from '../config/rabbitmq';
import logger from "../service/logger";
import producer from '../config/producer';
import rtlayer from '../config/rtlayer';
import { EventSchema } from '../type/event';
import { generateThreadName } from '../service/thread';
import { createThread, getThreadById, searchThreads, updateThreadName } from '../dbservices/thread';
import { updateDiary } from '../service/diary';
import AgentService from '../dbservices/agent';
import { v4 as uuidv4 } from 'uuid';
import { AgentSchema } from '../type/agent';
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
                    await updateThreadName(data.threadId, name);
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
                        privacy: data.visibility,
                        content: response.content,
                        pageId: data.pageId,
                        heading: page?.heading
                    });

                    break;
                }
            case 'fallback':
                {
                    const threadName = await generateThreadName(data.threadId, data.message, `Generate thread name for message "${data.message}"`);
                    const similarThreads = await searchThreads(data.agentId, threadName, { type: 'fallback' });
                    // TODO: Create a new bridge to do selection of thread and replace below
                    const threadSelectorModel = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY).useBridge("6758354ff2bb1d19ee083e92").useOpenAI("gpt-4-turbo").build();
                    let selectedThreadId = await threadSelectorModel.sendMessage(`Select the most relevant thread for message "${data.message}"from the following list: ${similarThreads.map((thread) => thread.name).join(", ")}`);
                    const agent = await AgentService.getAgentById(data.agentId);
                    if (!selectedThreadId) {
                        // Create a new thread for owner to answer this query
                        const thread = await createThread({ createdBy: agent.createdBy, name: threadName, middleware_id: uuidv4(), agent: data.agentId, type: 'fallback' });
                        selectedThreadId = thread._id?.toString();
                    }
                    // TODO: Format the message if needed and send it to the selected thread
                    await threadSelectorModel.createMessage(selectedThreadId, data.message);
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