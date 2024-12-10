import { Response, Request } from 'express';
import { error } from "console";
import { updateUserService } from "../dbservices/user";
import { userChannelPoxyMap } from "../middleware/authentication";
import { NextFunction } from 'connect';
import { ModelSchema } from '../utility/aimiddleware';

export const getUser = async (req: Request, res: Response) => {
    const user = res.locals?.user;
    return res.status(200).json({ success: true, data: { ...user } });
};
export const updateAIService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = res.locals?.user;
        const newAIModel = req.body.model;
        const newAIService = req.body.service;
        ModelSchema.parse({ service: newAIService, model: newAIModel });
        const updatedUser = await updateUserService({ userId: user._id, model: newAIModel, service: newAIService });
        return res.status(200).json({ success: true, data: updatedUser });

    } catch (error: any) {
        next(error);
    }
};