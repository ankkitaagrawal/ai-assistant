import { NextFunction } from "connect";
import { AIMiddlewareBuilder } from "../utility/aimiddleware";
import { Response, Request } from 'express';
import { ApiError } from "../error/api-error";
import { createThread, getThreadById, updateThreadName } from "../dbservices/thread";
import { v4 as uuidv4 } from 'uuid';
import { isArray, pick } from "lodash";
import env from '../config/env';
import { APIResponseBuilder } from "../service/utility";
import AgentService from "../dbservices/agent";
import ResourceService from "../dbservices/resource";
import producer from "../config/producer";
import { generateThreadNameSchema, updateDiarySchema } from "../type/event";

export const getThreadMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const threadId = req.params.tid;
        const user = res.locals?.user;
        const thread = await getThreadById(threadId.toString());
        if (!threadId) throw new ApiError('Thread Id is required', 400);
        if (!thread) throw new ApiError('Thread not found', 404);
        if (thread?.createdBy != user._id) throw new ApiError('Unauthorized', 401);
        const agent = await AgentService.getAgentById(thread.agent);
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
            const thread = await createThread({ createdBy: user._id?.toString(), name: message?.slice(0, 10), middleware_id: uuidv4(), agent: agentId });
            if (thread?._id) threadId = thread._id;
        }

        const thread = await getThreadById(threadId.toString());
        if (!thread) throw new ApiError('Thread not found', 404);
        if (thread.createdBy != user._id) throw new ApiError('Unauthorized', 401);

        const [agent, resources] = await Promise.all([
            AgentService.getAgentById(thread.agent),
            ResourceService.getResourcesByAgent(thread.agent)
        ]);

        const resourcesTitles = resources.map((resource, index) => `${index + 1}. ${resource.title}`).join('\n');
        const aiMiddlewareBuilder = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY);
        let diary = agent.publicDiary?.slice(-30).map((data) => data.info).join(",") || "";

        if (agent.createdBy === user._id) {
            const privateDiary = agent.privateDiary?.slice(-30).map((data) => data.info).join(",") || "";
            diary += privateDiary;
        }
        const variables = {
            assistantName: agent.name,
            agentId: agentId,
            agentOwnerId: agent.createdBy,
            user_id: user._id,
            channeUserId: user.channelId,
            username: user.name,
            availableDocs: resourcesTitles,
            diary: diary,
            instructions: agent.instructions || ""
        };

        const userModel = aiMiddlewareBuilder
            .useBridge(agent.bridgeId)
            .useService(agent.llm.service, agent.llm.model)
            .build();

        const response = await userModel.sendMessage(message, threadId, variables);

        const QUEUE_NAME = process.env.UTILITY_QUEUE || 'assistant-utility';
        if (isNewThread && thread?._id && response) await publishThreadNameEvent(message, response, thread._id, QUEUE_NAME);
        await producer.publishToQueue(QUEUE_NAME, updateDiarySchema.parse({ event: "updateDiary", data: { message: message, agentId } }));

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
const publishThreadNameEvent = async (message: string, response: string, threadId: string, QUEUE_NAME: string) => {
    const generateThreadNameEvent = {
        event: 'generate-thread-name',
        data: {
            message,
            response,
            threadId: threadId.toString()
        }
    };
    await producer.publishToQueue(QUEUE_NAME, generateThreadNameSchema.parse(generateThreadNameEvent));
};
