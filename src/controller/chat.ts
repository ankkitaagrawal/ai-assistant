import { NextFunction } from "connect";
import { AIMiddlewareBuilder } from "../utility/aimiddleware";
import { Response, Request } from 'express';
import { ApiError } from "../error/api-error";
import ThreadService from "../dbservices/thread";
import { v4 as uuidv4 } from 'uuid';
import { isArray, pick } from "lodash";
import env from '../config/env';
import { APIResponseBuilder } from "../service/utility";
import AgentService from "../dbservices/agent";
import ResourceService from "../dbservices/resource";
import producer from "../config/producer";
import { generateThreadNameSchema, updateDiarySchema } from "../type/event";
import { DiaryPage } from "../type/agent";
const UTILITY_QUEUE = process.env.UTILITY_QUEUE || 'assistant-utility';

export const getThreadMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const threadId = req.params.tid;
        const user = res.locals?.user;
        const thread = await ThreadService.getThreadById(threadId.toString());
        if (!threadId) throw new ApiError('Thread Id is required', 400);
        if (!thread) throw new ApiError('Thread not found', 404);

        const agent = await AgentService.getAgentById(thread.agent);

        let isAllowed = false;
        // Allow editors to access fallback threads
        if (thread.type == 'fallback' && agent?.editors) isAllowed = agent.editors.some((editor: any) => editor._id?.toString() === user?._id?.toString());
        // Allow access to owner of the thread
        if (thread.createdBy == user._id) isAllowed = true;
        if (!isAllowed) throw new ApiError('Unauthorized', 401);

        const aiMiddlewareBuilder = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY);
        const middleware = aiMiddlewareBuilder.useBridge(agent.bridgeId).useService(agent.llm.service, agent.llm.model).build();
        const response = await middleware.getMessages(threadId);
        let messages = response?.data;
        const selectFields = ['id', 'content', 'createdAt', 'role', 'org_id'];
        const selectRole = ['user', 'assistant'];
        if (isArray(messages)) {
            messages = messages.
                filter((message) => message.role && selectRole.includes(message.role)).
                map((message: any) => pick(message, selectFields)).
                slice(0, 100);
        }
        return res.status(200).json({ success: true, data: { messages: messages, count: messages?.length } })
    } catch (err: any) {
        console.log(err, "-err-", err?.message);
        next(err);
    }
};

export const sendMessageToThread = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();

    try {
        const { message } = req.body;
        let threadId = req.query.tid as string;
        const user = res.locals?.user;

        if (!user.agent) throw new Error('User does not have an agent');
        if (!message) throw new ApiError('Message is required', 400);

        const agentId = req.body.agent || user.agent?.toString();

        let isNewThread = false;
        if (!threadId) {
            // Create a new thread
            isNewThread = true;
            const thread = await ThreadService.createThread({ createdBy: user._id?.toString(), name: message?.slice(0, 10), middleware_id: uuidv4(), agent: agentId });
            if (thread?._id) threadId = thread._id;
        }

        const thread = await ThreadService.getThreadById(threadId.toString());
        if (!thread) throw new ApiError('Thread not found', 404);

        const [agent, resources] = await Promise.all([
            AgentService.getAgentById(thread.agent),
            ResourceService.getResourcesByAgent(thread.agent)
        ]);
        // Permission Check
        let isAllowed = false;
        // Allow editors to access fallback threads
        if (thread.type == 'fallback' && agent?.editors) isAllowed = agent.editors.some((editor: any) => editor._id?.toString() === user?._id?.toString());
        // Allow access to owner of the thread
        if (thread.createdBy == user._id) isAllowed = true;
        if (!isAllowed) throw new ApiError('Unauthorized', 401);

        const resourceContext = resources.map((resource, index) => `${index + 1}. Title: ${resource.title} \n\n Description: ${resource?.description}`).join('\n');
        const aiMiddlewareBuilder = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY);

        const publicDiary: Array<DiaryPage> = [];
        const privateDiary: Array<DiaryPage> = [];
        const threadDiary: Array<DiaryPage> = [];
        for (const pageId in agent?.diary) {
            const page = (agent?.diary as any)?.[pageId];
            if (page.privacy === 'public') publicDiary.push({ ...page, id: pageId });
            if (page.privacy === 'private') privateDiary.push({ ...page, id: pageId });
            if (page.privacy === 'thread' && pageId == threadId?.toString()) threadDiary.push({ ...page, id: pageId });
        }
        let systemPrompt = `You are ${agent.name}'s assistant  and user ${user.name} is talking with you.`
        let diary = `Privacy    |   Page Id       |      Heading \n`;
        diary += publicDiary.slice(-30).map((data) => `${data.privacy}   |   ${data.id}    |   ${data.heading}`).join("\n") || "";
        if (agent.createdBy === user._id) {
            diary += privateDiary?.slice(-30).map((data) => `${data.privacy}   |   ${data.id}    |   ${data.heading}`).join("\n") || "";
            systemPrompt = `You are ${user.name}'s Personal Assistant `
        }
        let threadDiaryContext = `Thread Context: ${threadDiary.find((page) => page.id == threadId)?.content}`;
        const variables = {
            assistantName: agent.name,
            agentId: agentId,
            agentOwnerId: agent.createdBy,
            user_id: user._id,
            channeUserId: user.channelId,
            username: user.name,
            diary: diary,
            threadDiary: threadDiaryContext,
            systemPrompt: systemPrompt,
            instructions: agent.instructions || "",
            availableDocs: resourceContext,
            threadId: thread._id,
            currentTimeAndDate: new Date()
        };

        let userModel = aiMiddlewareBuilder
            .useBridge(agent.bridgeId)
            .useService(agent.llm.service, agent.llm.model);

        // Add tool based on the thread type
        if (thread.type === 'fallback') {
            userModel = userModel.addTool("sendmessage", { agentId, threadId });
        } else {
            userModel = userModel.addTool("pingowner", { agentId, threadId, userId: user?._id });
        }
        const builtUserModel = userModel.build();
        const response = await builtUserModel.sendMessage(message, threadId, variables);

        if (isNewThread && thread?._id && response) await publishThreadNameEvent(message, response, thread._id);


        const data = {
            message: response,
            tid: thread._id,
            thread: isNewThread ? thread : undefined
        };

        return res.status(200).json(responseBuilder.setSuccess(data).build());
    } catch (error) {
        next(error);
    }
};

// TODO: Can we move it somewhere else?
const publishThreadNameEvent = async (message: string, response: string, threadId: string) => {
    const generateThreadNameEvent = {
        event: 'generate-thread-name',
        data: {
            message,
            response,
            threadId: threadId.toString()
        }
    };
    await producer.publishToQueue(UTILITY_QUEUE, generateThreadNameSchema.parse(generateThreadNameEvent));
};
