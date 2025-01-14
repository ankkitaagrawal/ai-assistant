import { Response, Request } from 'express';
import { NextFunction } from 'connect';
import { ModelSchema } from '../type/ai_middleware';
import { APIResponseBuilder } from '../service/utility';
import AgentService from '../dbservices/agent';
import { fallbackSchema, messageSchema } from '../type/event';
import producer from '../config/producer';
import logger from '../service/logger';
const UTILITY_QUEUE = process.env.UTILITY_QUEUE || 'assistant-utility';
export const sendFallbackMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const responseBuilder = new APIResponseBuilder();
        const fallbackEvent = {
            data: { ...req.body },
            event: 'fallback',
        }
        const fallbackMessage = fallbackSchema.parse(fallbackEvent);

        producer.publishToQueue(UTILITY_QUEUE, fallbackMessage);
        const response = responseBuilder.setSuccess({ message: "Successfully send message to owner" }).build();
        res.json(response);
    } catch (error) {
        logger.error(error);
        next(error);
    }
};


export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const responseBuilder = new APIResponseBuilder();
        const { messages, agentId } = req.body;
        const agent = await AgentService.getAgentById(agentId).catch((error) => {
            logger.error(error);
            throw new Error("Invalid agentId");
        })
        if (!agent) throw new Error("Invalid agentId");
        for (const { threadId, message, ownerThreadId } of messages) {
            const messageEvent = {
                event: 'message',
                data: {
                    to: threadId,
                    from: agentId,
                    message: message,
                    ownerThreadId: ownerThreadId
                }
            }
            const event = messageSchema.safeParse(messageEvent);
            if (event?.error) {
                logger.error(event.error);
                continue;
            }
            producer.publishToQueue('assistant-utility', messageSchema.parse(messageEvent));
        }
        const response = responseBuilder.setSuccess({ message: "Message Sent!" }).build();
        res.json(response);
    } catch (error) {
        next(error);
    }
}