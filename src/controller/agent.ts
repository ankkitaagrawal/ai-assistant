import express, { NextFunction, Request, Response } from 'express';
import AgentService from '../dbservices/agent';
import { APIResponseBuilder, getDefaultPicture } from '../service/utility';
import { Agent as AgentType, DiaryPage } from '../type/agent';
import { v4 as uuidv4 } from 'uuid';
import producer from '../config/producer';
import { queryLangchain } from '../service/langchain';
import { pick } from 'lodash';
import { ApiError } from '../error/api-error';
import axios from '../config/axios';
import ChunkService from '../dbservices/chunk';
import { getUserByEmailId } from '../utility/channel';
import { getUserByChannelId } from '../dbservices/user';
import { updateDiarySchema } from '../type/event';


// Create a new agent
export const createAgent = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const user = res.locals.user;
        const agentData = req.body;
        agentData.bridgeId = agentData.bridgeId || "675b2637746e370c5a559ea2";
        agentData.createdBy = user?._id;
        const newAgent = await AgentService.createAgent(agentData);
        responseBuilder.setSuccess(newAgent);
        res.json(responseBuilder.build());
    } catch (error: any) {
        next(error);
    }
};

// Get all agents
export const getAgents = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const agents = await AgentService.getAgents();
        const agentFields = ['_id', 'name', 'description', 'logo', 'createdBy', 'editors'];
        const response = {
            agents: agents.map((agent) => pick(agent, agentFields)),
        }
        responseBuilder.setSuccess(response);
        res.status(200).json(responseBuilder.build());
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
        const user = res.locals.user;
        const { id } = req.params;
        const updateData = req.body as Partial<AgentType>;
        delete updateData.createdBy; // Don't allow createdBy to be updated
        delete updateData.editors; // Don't allow editors to be updated
        const agent = await AgentService.getAgentById(id);
        if (agent?.createdBy !== user?._id) throw new ApiError('You are not authorized to update this agent', 403);
        if (updateData.name) {
            updateData.logo = getDefaultPicture(updateData.name);
        }
        const updatedAgent = await AgentService.updateAgent(id, updateData);
        responseBuilder.setSuccess(updatedAgent);
        res.status(200).json(responseBuilder.build());
    } catch (error: any) {
        next(error);
    }
};

// Update  link in the agent 
export const updateLinkInAgent = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { id } = req.params;
        const { docLink, docTitle } = req.body;
        const docId = uuidv4();
        const newLink = {
            title: docTitle,
            url: docLink,
            id: docId
        };
        const updatedAgent = await AgentService.addDocInAgent(id, newLink);
        const QUEUE_NAME = process.env.AGENT_QUEUE || 'agent';
        await producer.publishToQueue(QUEUE_NAME, { ...newLink, assistantId: id })
        responseBuilder.setSuccess(updatedAgent);
        res.status(200).json(responseBuilder.build());
    } catch (error: any) {
        next(error);
    }
};


export const getDocContextofAgent = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { prompt } = req.body;
        const { id } = req.params;
        const data = {
            "query": prompt,
            "agentId": id
        };
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://dev-assistant-api-1091285226236.us-east4.run.app/utility/search',
            data: data
        };
        // TODO: Remove logs
        console.log(Date.now(), "Querying Vector DB");
        const response = await axios.request(config);
        const vectorIds = response.data?.data?.docs as string[] || [];
        console.log(Date.now(), "Vector DB response received");
        const textChunks = await Promise.all(vectorIds.map(async (id: string) => (await ChunkService.getChunkById(id))?.data));
        console.log(Date.now(), "Chunks received");
        responseBuilder.setSuccess({ data: textChunks.join(" \n") });
        res.status(200).json(responseBuilder.build());
    } catch (error: any) {
        next(error);
    }
};

export const addEditor = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { id } = req.params;
        const agent = await AgentService.getAgentById(id);
        const isOwner = agent?.createdBy == res.locals.user?._id?.toString();
        if (!isOwner) throw new ApiError('You are not authorized to manage editors', 403);
        const { emails }: { emails: Array<string> } = req.body;
        for (const email of emails) {
            const channelUser = await getUserByEmailId(email);
            const user = await getUserByChannelId({ channelId: channelUser?.userId });
            const userId = user?._id?.toString();
            if (!userId) continue;
            const updatedAgent = await AgentService.addEditor(id, userId);
            responseBuilder.setSuccess(updatedAgent);
        }
        res.status(200).json(responseBuilder.build());
    } catch (error: any) {
        next(error);
    }
}

export const removeEditor = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { id, editorId } = req.params;
        const agent = await AgentService.getAgentById(id);
        const isOwner = agent?.createdBy == res.locals.user?._id?.toString();
        if (!isOwner) throw new ApiError('You are not authorized to manage editors', 403);
        const updatedAgent = await AgentService.removeEditor(id, editorId);
        responseBuilder.setSuccess(updatedAgent);
        res.status(200).json(responseBuilder.build());
    } catch (error: any) {
        next(error);
    }
}

export const getHeadingDataFromDiary = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { id, pageId } = req.params
        const agent = await AgentService.getAgentById(id);
        const content = (agent?.diary as any)?.[pageId];;
        responseBuilder.setSuccess({ content });
        res.status(200).json(responseBuilder.build());
    } catch (error: any) {
        next(error);
    }
}

export const updateDiary = async (req: Request, res: Response, next: NextFunction) => {
    const responseBuilder = new APIResponseBuilder();
    try {
        const { id } = req.params;
        const { headingId, message, privacy, heading } = req.body;
        const UTILITY_QUEUE = process.env.UTILITY_QUEUE || 'assistant-utility';
        await producer.publishToQueue(UTILITY_QUEUE, updateDiarySchema.parse({ event: "update-diary", data: { message: message, agentId: id, pageId: headingId, privacy, heading } }));
        responseBuilder.setSuccess({ message: "Diary updated successfully" });
        res.status(200).json(responseBuilder.build());
    } catch (error: any) {
        console.log(error);
        next(error);
    }
}

