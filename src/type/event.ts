import z from 'zod';


export const generateThreadNameSchema = z.object({
    event: z.literal('generate-thread-name'),
    data: z.object({
        threadId: z.string(),
        message: z.string(),
        response: z.string()
    })
});
export type GenerateThreadName = z.infer<typeof generateThreadNameSchema>;


export const updateDiarySchema = z.object({
    event: z.literal('update-diary'),
    data: z.object({
        agentId: z.string(),
        message: z.string(),
        pageId: z.string().optional(),
        visibility: z.enum(["public", "private"]).default("private"),
        heading: z.string().optional()
    })
});
export type UpdateDiary = z.infer<typeof updateDiarySchema>;

export const fallbackSchema = z.object({
    event: z.literal('fallback'),
    data: z.object({
        agentId: z.string().describe("The ID of the agent"),
        message: z.string().describe("The message for which the fallback is triggered"),
        threadId: z.string().describe("The ID of thread in which message was sent"),
        userId: z.string().describe("The ID of user who sent the message"),
    })
})
export type Fallback = z.infer<typeof fallbackSchema>;

export const EventSchema = z.discriminatedUnion('event', [
    generateThreadNameSchema, updateDiarySchema, fallbackSchema
]);
export type Event = z.infer<typeof EventSchema>;