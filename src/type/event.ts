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






export const EventSchema = z.discriminatedUnion('event', [
    generateThreadNameSchema
]);
export type Event = z.infer<typeof EventSchema>;