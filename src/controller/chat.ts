import { NextFunction } from "connect";
import { getPreviousMessage, sendMessage } from "../utility/aimiddleware";
import { Response, Request } from 'express';
import { ApiError } from "../error/api-error";
import { createThread, getThreadById, updateThreadName } from "../dbservices/thread";
import { v4 as uuidv4 } from 'uuid';


export const getThreadMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const threadId = req.params.tid;
        const user = res.locals?.user;
        const thread = await getThreadById(threadId.toString());
        if (!threadId) throw new ApiError('Thread Id is required', 400);
        if (thread?.createdBy != user._id) throw new ApiError('Unauthorized', 401);
        if (!thread) throw new ApiError('Thread not found', 404);
        const response = await getPreviousMessage(thread?.middleware_id);
        return res.status(200).json({ success: true, data: { messages: response?.data } })
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
        const variables = {
            user_id: user._id,
            channelUserId: user.channelId,
        }
        const response = await sendMessage(message, variables, thread?.middleware_id);
        if (isNewThread && thread?._id && response) updateThreadName(thread?._id, response?.slice(0, 10));
        return res.status(200).json({ success: true, data: { message: response, tid: thread?._id } })
    } catch (error) {
        next(error);
    }
}
