import { Response, Request } from 'express';
import { NextFunction } from 'connect';
import { ModelSchema } from '../type/ai_middleware';
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
        const updatedAgent = AgentService.updateAgent(user.agent, { llm: { model: newAIModel, service: newAIService } });
        const response = responseBuilder.setSuccess(updatedAgent as any).build();
        return res.status(200).json(response);

    } catch (error: any) {
        next(error);
    }
};