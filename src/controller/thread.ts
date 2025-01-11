import { createThread, getThreadById, getUserThreads } from "../dbservices/thread";
import { Response, Request } from 'express';
import { ApiError } from "../error/api-error";
import { NextFunction } from "connect";
import { APIResponseBuilder } from "../service/utility";

export const getThreads = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const user = res.locals?.user;
        const userId = user?._id;
        const { assistantId } = req.params;
        let threads = await getUserThreads(userId?.toString(), assistantId);
        return res.status(200).json(responseBuilder.setSuccess({ threads }).build());
    } catch (err: any) {
        console.log(err.response)
        next(new ApiError(err.message, 400));
    }
};