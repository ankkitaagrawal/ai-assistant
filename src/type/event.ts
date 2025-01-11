import z from 'zod';
import { DiaryPageSchema } from './agent';


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
    data: DiaryPageSchema.pick({ privacy: true, heading: true }).extend({
        agentId: z.string(),
        message: z.string(),
        pageId: z.string().optional(),
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



export const messageSchema = z.object({
    event: z.literal('message'),
    data: z.object({
        to: z.string().describe("Thread ID in which message is to be sent"),
        from: z.string().describe("Agent Id of the agent sending the message"),
        message: z.string().describe("The message to be sent"),
    })
});
export type Message = z.infer<typeof messageSchema>;



export const EventSchema = z.discriminatedUnion('event', [
    generateThreadNameSchema, updateDiarySchema, fallbackSchema, messageSchema
]);
export type Event = z.infer<typeof EventSchema>;