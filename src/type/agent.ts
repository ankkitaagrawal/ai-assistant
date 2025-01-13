import { z } from 'zod';
import { ModelSchema, ServiceSchema } from './ai_middleware';

export const DiaryPageSchema = z.object({
    id: z.string().optional().describe("In case of privacy='thread', id will be threadId"),
    heading: z.string().optional(),
    content: z.string().optional(),
    privacy: z.enum(['public', 'private', 'thread']).default('private')
});
export const AgentSchema = z.object({
    _id: z.union([z.string(), z.object({})]).optional(),
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
    diary: z.map(z.string(), DiaryPageSchema).optional(),
});

export type Agent = z.infer<typeof AgentSchema>;
export type DiaryPage = z.infer<typeof DiaryPageSchema>;

