import express, { NextFunction, Request, Response } from 'express';
import AgentService from '../dbservices/agent';
import { APIResponseBuilder } from '../service/utility';
import { Agent as AgentType } from '../type/agent';

// Create a new agent
export const createAgent = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const user = res.locals.user;
        const agentData = req.body;
        agentData.createdBy = user?._id;
        const newAgent = await AgentService.createAgent(agentData);
        responseBuilder.setSuccess(newAgent);
        res.json(responseBuilder.build());
    } catch (error: any) {
        next(error);
    }
};

// Get an agent by ID
export const getAgent = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { id } = req.params;
        const agent = await AgentService.getAgentById(id);
        responseBuilder.setSuccess(agent);
        res.status(200).json(responseBuilder.build());
    } catch (error: any) {
        next(error);
    }
};

// Update an agent by ID
export const patchAgent = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { id } = req.params;
        const updateData = req.body as Partial<AgentType>;
        delete updateData.createdBy; // Don't allow createdBy to be updated
        const updatedAgent = await AgentService.updateAgent(id, updateData);
        responseBuilder.setSuccess(updatedAgent);
        res.status(200).json(responseBuilder.build());
    } catch (error: any) {
        next(error);
    }
};
