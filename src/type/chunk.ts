import { z } from 'zod';

export const ChunkSchema = z.object({
    _id: z.string().optional(),
    data: z.string().min(1, "Chunk content cannot be empty."),
    resourceId: z.string(),
    agentId: z.string(),
    public: z.boolean().default(false).optional(),
});

export type Chunk = z.infer<typeof ChunkSchema>;