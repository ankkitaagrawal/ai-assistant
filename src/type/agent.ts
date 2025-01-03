import { z } from 'zod';
import { ModelSchema, ServiceSchema } from './ai_middleware';
export const AgentSchema = z.object({
    _id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    logo: z.string().url().optional(),
    bridgeId: z.string(),
    llm: ModelSchema,
    vectorTable: z.string().optional(),
    prompt: z.string().optional(),
    editors: z.array(z.string()).optional(),
    createdBy: z.string(),
    instructions: z.string().optional(),
    privateDiary: z.array(
        z.object({
            createdAt: z.date(),
            info: z.string()
        })
    ).optional(),
    publicDiary: z.array(
        z.object({
            createdAt: z.date(),
            info: z.string()
        })
    ).optional(),
});

export type Agent = z.infer<typeof AgentSchema>;

