import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../error/api-error";
import logger from "../service/logger";


export default function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ApiError) {
        return res.status(err.code).json({ status: 'error', message: err.message, code: err.code });
    }
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'error',
            message: (err.issues)?.map((e) => {
                return { "field": e?.path[0], "message": e?.message }
            })
        })
    }
    // Default action for errors that are not handled.
    logger.error(err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error', code: 500 });
}