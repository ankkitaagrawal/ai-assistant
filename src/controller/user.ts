import { Response, Request } from 'express';
import { error } from "console";
import { updateUserService } from "../dbservices/user";
import { userChannelPoxyMap } from "../middleware/authentication";
import { NextFunction } from 'connect';
import { ModelSchema } from '../type/ai_middleware';
import { deleteCache, getUserKey } from '../service/cache';
import { APIResponseBuilder } from '../service/utility';
import AgentService from '../dbservices/agent';

export const getUser = async (req: Request, res: Response) => {
    const responseBuilder = new APIResponseBuilder();
    const user = res.locals?.user;
    const response = responseBuilder.setSuccess({ ...user }).build();
    return res.status(200).json(response);
};
// TODO: Remove its use from UI
export const updateAIService = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const user = res.locals?.user;
        const newAIModel = req.body.model;
        const newAIService = req.body.service;
        ModelSchema.parse({ service: newAIService, model: newAIModel });
        AgentService.updateAgent(user.agent, { llm: { model: newAIModel, service: newAIService } }); // TODO: Temporary fix, update llm details in agent model
        // TODO: Remove llm details from user model
        const updatedUser = await updateUserService({ userId: user._id, model: newAIModel, service: newAIService });
        // Delete cache
        deleteCache(getUserKey(user.proxyId, user.email));
        const response = responseBuilder.setSuccess(updatedUser as any).build();
        return res.status(200).json(response);

    } catch (error: any) {
        next(error);
    }
};