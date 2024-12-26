import z from 'zod';

export const EventTypeSchema = z.enum(['createThreadNameSchema']);
export type EventType = z.infer<typeof EventTypeSchema>;

export const createThreadNameSchema = z.object({
    event: z.literal('createThreadName'),
    data: z.object({
        threadId: z.string(),
        message: z.string(),
        response: z.string()
    })
});
export type LoadEvent = z.infer<typeof createThreadNameSchema>;

export const EventSchema = z.discriminatedUnion('event', [
    createThreadNameSchema
]);

export type Event = z.infer<typeof EventSchema>;