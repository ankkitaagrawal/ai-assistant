import z from 'zod';

export const ServiceSchema = z.enum(['openai', 'groq', 'anthropic']);
export type Service = z.infer<typeof ServiceSchema>;

export const GroqModelSchema = z.enum([
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-groq-70b-8192-tool-use-preview",
    "llama3-groq-8b-8192-tool-use-preview",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "mixtral-8x7b-32768",
    "gemma-7b-it",
    "gemma2-9b-it"
]);
export type GroqModel = z.infer<typeof GroqModelSchema>;

export const OpenAIModelSchema = z.enum([
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4-turbo',
    'gpt-4o',
    'chatgpt-4o-latest',
    'gpt-4o-mini'
]);
export type OpenAIModel = z.infer<typeof OpenAIModelSchema>;

export const AnthropicModelSchema = z.enum([
    'claude-3-5-sonnet-20240620',
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
]);
export type AnthropicModel = z.infer<typeof AnthropicModelSchema>;

export const ModelSchema = z.discriminatedUnion('service', [
    z.object({
        service: z.literal('groq'),
        model: GroqModelSchema
    }),
    z.object({
        service: z.literal('openai'),
        model: OpenAIModelSchema
    }),
    z.object({
        service: z.literal('anthropic'),
        model: AnthropicModelSchema
    })
]);
export type Model = z.infer<typeof ModelSchema>;



