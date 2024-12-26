import { Request, Response } from 'express';
import ResourceService from '../dbservices/resource';
import { ApiError } from '../error/api-error';
import { ResourceSchema } from '../type/resource';
import { NextFunction } from 'connect';
import { APIResponseBuilder } from '../service/utility';

// TODO: DANGER: Authorization is not implemented in this controller
export const createResource = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const user = res.locals.user;
        let resourceData = {
            ...req.body,
            createdBy: user?._id
        };

        resourceData = ResourceSchema.parse(resourceData);
        const resource = await ResourceService.createResource(resourceData);
        const response = responseBuilder.setSuccess(resource).build();
        res.status(201).json(response);
    } catch (error: any) {
        next(error);
    }
};

export const getResources = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();

    try {
        const { agentId } = req.query;
        const resources = await ResourceService.getResourcesByAgent(agentId as string);
        const response = responseBuilder.setSuccess({ resources }).build();

        res.status(200).json(response);
    } catch (error: any) {
        next(error);
    }
};

export const getResource = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { id } = req.params;
        const resource = await ResourceService.getResourceById(id);

        if (!resource) {
            throw new ApiError('Resource not found', 404);
        }
        const response = responseBuilder.setSuccess(resource).build();

        res.status(200).json(response);
    } catch (error: any) {
        next(error);
    }
};

export const updateResource = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { agentId, id } = req.params;
        const updateData = req.body;

        ResourceSchema.partial().parse(updateData);
        const resource = await ResourceService.updateResource(id, updateData);
        const response = responseBuilder.setSuccess(resource).build();

        res.status(200).json(response);
    } catch (error: any) {
        next(error);
    }
};

export const deleteResource = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { agentId, id } = req.params;
        const deletedResource = await ResourceService.deleteResource(id);
        const response = responseBuilder.setSuccess(deletedResource).build();

        res.status(200).json(response);
    } catch (error: any) {
        next(error);
    }
};


export const updateMetadata = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { agentId, id } = req.params;
        const { metadata } = req.body;

        const resource = await ResourceService.updateMetadata( id, metadata);
        const response = responseBuilder.setSuccess(resource).build();
        res.status(200).json(response);
    } catch (error: any) {
        next(error);
    }
};

export const refreshResource = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { agentId, id } = req.params;
        const resource = await ResourceService.updateResource(id, { refreshedAt: new Date() });
        const response = responseBuilder.setSuccess(resource).build();
        res.status(200).json(response);
    } catch (error: any) {
        next(error);
    }
}