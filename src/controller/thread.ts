import { createThread, getThreadById, getUserThreads, searchThreads } from "../dbservices/thread";
import { Response, Request } from 'express';
import { getUser } from "../utility/channel";
import { ApiError } from "../error/api-error";
import { NextFunction } from "connect";
import { APIResponseBuilder } from "../service/utility";

export const getThreads = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const user = res.locals?.user;
        const userId = user?._id;
        const { assistantId } = req.params;
        let threads = (await getUserThreads(userId?.toString(), assistantId))?.filter((thread) => thread.type != "fallback");
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
        let threads = await searchThreads(assistantId, query);
        return res.status(200).json(responseBuilder.setSuccess({ threads }).build());
    } catch (err: any) {
        console.log(err.response)
        next(new ApiError(err.message, 400));
    }
};