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
    docLinks: z.array(
        z.object({
            id: z.string(),
            title: z.string().optional(),
            url: z.string().url(),
        })
    ).optional(),
});

export type Agent = z.infer<typeof AgentSchema>;

