import ThreadService from '../dbservices/thread';
import { Response, Request } from 'express';
import { getUser } from "../utility/channel";
import { ApiError } from "../error/api-error";
import { NextFunction } from "connect";
import { APIResponseBuilder } from "../service/utility";
import AgentService from "../dbservices/agent";
import logger from '../service/logger';

export const getThreads = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const user = res.locals?.user;
        const userId = user?._id;
        const { assistantId } = req.params;
        let threads = (await ThreadService.getUserThreads(userId?.toString(), assistantId))?.filter((thread) => thread.type != "fallback");
        return res.status(200).json(responseBuilder.setSuccess({ threads }).build());
    } catch (err: any) {
        console.log(err.response)
        next(new ApiError(err.message, 400));
    }
};

export const searchThread = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const user = res.locals?.user;
        const userId = user?._id;
        const { assistantId } = req.params;
        const query = req.query.q as string;
        let threads = await ThreadService.searchThreads(assistantId, query);
        return res.status(200).json(responseBuilder.setSuccess({ threads }).build());
    } catch (err: any) {
        console.log(err.response)
        next(new ApiError(err.message, 400));
    }
};

export const getFallbackThreads = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const user = res.locals?.user;
        const userId = user?._id;
        const { assistantId } = req.params;
        if (!assistantId) throw new Error("Assistant ID is required");
        const agent = await AgentService.getAgentById(assistantId).catch((error) => {
            logger.error(error);
            throw new Error("Invalid Assistant ID");
        })
        let isAllowed = false;
        if (agent?.editors) isAllowed = isAllowed = agent.editors.some((editor: any) => editor._id?.toString() === user?._id?.toString());
        if (agent.createdBy == userId) isAllowed = true;
        if (!isAllowed) return next(new ApiError("You are not allowed to view this assistant's fallback threads", 403));
        let threads = await ThreadService.getFallbackThreads(assistantId)
        return res.status(200).json(responseBuilder.setSuccess({ threads }).build());
    } catch (err: any) {
        console.log(err.response)
        next(new ApiError(err.message, 400));
    }
}