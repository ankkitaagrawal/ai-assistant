import { NextFunction } from "connect";
import { AIMiddlewareBuilder, getPreviousMessage, sendMessage } from "../utility/aimiddleware";
import { Response, Request } from 'express';
import { ApiError } from "../error/api-error";
import { createThread, getThreadById, updateThreadName } from "../dbservices/thread";
import { v4 as uuidv4 } from 'uuid';
import { isArray, pick } from "lodash";
import env from '../config/env';
import { APIResponseBuilder } from "../service/utility";
import AgentService from "../dbservices/agent";

export const getThreadMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const threadId = req.params.tid;
        const user = res.locals?.user;
        const thread = await getThreadById(threadId.toString());
        if (!threadId) throw new ApiError('Thread Id is required', 400);
        if (thread?.createdBy != user._id) throw new ApiError('Unauthorized', 401);
        if (!thread) throw new ApiError('Thread not found', 404);
        const response = await getPreviousMessage(thread?._id);
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
    // TODO: This method is getting too long. Consider refactoring it.
    const responseBuilder = new APIResponseBuilder();
    try {
        let threadId = req.query.tid as string;
        const user = res.locals?.user;
        if (!user.agent) throw new Error('User does not have an agent');
        const { message } = req.body;
        let isNewThread = false;
        if (!message) throw new ApiError('Message is required', 400);
        const agentId = req.body.agent || user.agent?.toString();
        if (!threadId) {
            isNewThread = true;
            const middlewareId = uuidv4();
            const thread = await createThread({ createdBy: user._id?.toString(), name: message?.slice(0, 10), middleware_id: middlewareId, agent: agentId });
            if (thread?._id) threadId = thread._id;
        }
        const thread = await getThreadById(threadId.toString());
        if (!thread) throw new ApiError('Thread not found', 404);
        if (thread?.createdBy != user._id) throw new ApiError('Unauthorized', 401);
        const agent = await AgentService.getAgentById(thread.agent);
        const aiMiddlewareBuilder = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY as string);
        const variables = {
            agentId :agentId ,
            user_id: user._id,
            channeUserId: user.channelId,
            diary: user.prompt,
            username: user.name
        };
        const userModel = aiMiddlewareBuilder.useBridge(agent.bridgeId).useService(agent.llm.service, agent.llm.model).build();
        const response = await userModel.sendMessage(message, threadId, variables);
        if (isNewThread && thread?._id && response) {
            const namingModel = aiMiddlewareBuilder.useOpenAI("gpt-4-turbo").useBridge("6758354ff2bb1d19ee083e92").build();
            const prompt = `User: ${message} \n Assistant: ${response}`;
            const name = await namingModel.sendMessage(prompt)
            thread.name = name;
            updateThreadName(thread?._id, name);
        };
        const data = { message: response, tid: thread?._id, thread: ((isNewThread) ? thread : undefined) }
        return res.status(200).json(responseBuilder.setSuccess(data).build());
    } catch (error) {
        next(error);
    }
}
