import { z } from 'zod';
import { ModelSchema, ServiceSchema } from './ai_middleware';
export const AgentSchema = z.object({
    _id: z.string().optional(),
    name: z.string(),
    bridgeId: z.string(),
    llm: ModelSchema,
    vectorTable: z.string().optional(),
    prompt: z.string().optional(),
    createdBy: z.string(),
});

export type Agent = z.infer<typeof AgentSchema>;

