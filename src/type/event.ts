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
    event: z.literal('updateDiary'),
    data: z.object({
        agentId :  z.string() ,
        message: z.string()
    })
});
export type updateDiary = z.infer<typeof updateDiarySchema>;




export const EventSchema = z.discriminatedUnion('event', [
    generateThreadNameSchema , updateDiarySchema
]);
export type Event = z.infer<typeof EventSchema>;