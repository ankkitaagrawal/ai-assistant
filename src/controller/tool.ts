import { Response, Request } from 'express';
import { NextFunction } from 'connect';
import { ModelSchema } from '../type/ai_middleware';
import { APIResponseBuilder } from '../service/utility';
import AgentService from '../dbservices/agent';
import { fallbackSchema } from '../type/event';
import producer from '../config/producer';
import logger from '../service/logger';

export const sendFallbackMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const responseBuilder = new APIResponseBuilder();
        const fallbackMessage = fallbackSchema.parse(req.body);
        const fallbackEvent = {
            ...fallbackMessage,
            event: 'fallback',
        }
        producer.publishToQueue('assistant-utility', fallbackEvent);
        const response = responseBuilder.setSuccess().build();
        res.json(response);
    } catch (error) {
        logger.error(error);
        next(error);
    }
};