import { NextFunction } from "connect";
import { AIMiddlewareBuilder, getPreviousMessage, sendMessage } from "../utility/aimiddleware";
import { Response, Request } from 'express';
import { ApiError } from "../error/api-error";
import { createThread, getThreadById, updateThreadName } from "../dbservices/thread";
import { v4 as uuidv4 } from 'uuid';
import { isArray, pick } from "lodash";
import env from '../config/env';

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
        next(err);
    }
};

export const sendMessageToThread = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let threadId = req.query.tid as string;
        const user = res.locals?.user;
        const { message } = req.body;
        let isNewThread = false;
        if (!message) throw new ApiError('Message is required', 400);
        if (!threadId) {
            isNewThread = true;
            const middlewareId = uuidv4();
            const thread = await createThread({ createdBy: user._id?.toString(), name: message?.slice(0, 10), middleware_id: middlewareId });
            if (thread?._id) threadId = thread._id;
        }
        const thread = await getThreadById(threadId.toString());
        if (thread?.createdBy != user._id) throw new ApiError('Unauthorized', 401);
        const aiMiddlewareBuilder = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY as string);
        const variables = {
            user_id: user._id,
            channeUserId: user.channelId,
            diary: user.prompt,
            username :user.name
        };

        const userModel = aiMiddlewareBuilder.useService(user.service, user.model).build();
        const response = await userModel.sendMessage(message, threadId, variables);
        if (isNewThread && thread?._id && response) {
            const namingModel = aiMiddlewareBuilder.useOpenAI("gpt-4-turbo").useBridge("6758354ff2bb1d19ee083e92").build();
            const prompt = `User: ${message} \n Assistant: ${response}`;
            const name = await namingModel.sendMessage(prompt)
            thread.name = name;
            updateThreadName(thread?._id, name);
        };
        return res.status(200).json({ success: true, data: { message: response, tid: thread?._id, thread: ((isNewThread) ? thread : undefined) } })
    } catch (error) {
        next(error);
    }
}
