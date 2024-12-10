import axios, { AxiosResponse } from "axios"
import { z } from 'zod';
export const sendMessage = async (usermessage: string, variables?: object | null, thread_id?: string, model?: string): Promise<string | null> => {
  const response: AxiosResponse<any> = await axios.post(
    'https://routes.msg91.com/api/proxy/1258584/29gjrmh24/api/v2/model/chat/completion',
    {
      user: usermessage,
      variables: variables,
      bridge_id: "6733097358507028fd81de16",
      thread_id: thread_id,
      RTLayer: false,
      response_type: 'text',
      "configuration": {
        "model": model || 'gpt-4o',
      },
      "service": "openai",
    },
    {
      headers: {
        pauthkey: process.env.AI_MIDDLEWARE_AUTH_KEY as string,
      },
    }
  );
  return response.data?.response?.data?.content || null;

};

export const getPreviousMessage = async (thread_id?: string): Promise<AxiosResponse<any> | null> => {
  const response: AxiosResponse<any> = await axios.get(
    `https://routes.msg91.com/api/proxy/1258584/32nghul25/api/v1/config/threads/${thread_id}/6733097358507028fd81de16`,
    {
      headers: {
        pauthkey: process.env.AI_MIDDLEWARE_AUTH_KEY as string,
        'Content-Type': 'application/json',
      },
    }
  );
  return response?.data;

};
export const createMessage = async (thread_id: string, message: string): Promise<string | null> => {
  const response: AxiosResponse<any> = await axios.post(
    `https://proxy.viasocket.com/proxy/api/1258584/32nghul25/api/v1/config/threads/${thread_id}/6733097358507028fd81de16`,
    {
      "message": message
    },
    {
      headers: {
        pauthkey: process.env.AI_MIDDLEWARE_AUTH_KEY as string,
        'Content-Type': 'application/json',
      },
    }
  );
  return response?.data;

};


class AIMiddleware {
  private authKey: string;
  private rtlayer: boolean;
  private bridgeId: string;
  private responseType: string;
  private model: string;
  private service: string;
  constructor(authKey: string, bridgeId: string, responseType: string, model: string, service: string, rtlayer: boolean = false) {
    this.authKey = authKey;
    this.rtlayer = rtlayer;
    this.bridgeId = bridgeId;
    this.responseType = responseType;
    this.model = model;
    this.service = service;
  }

  async getMessages(threadId: string) {
    const response: AxiosResponse<any> = await axios.get(
      `https://routes.msg91.com/api/proxy/1258584/32nghul25/api/v1/config/threads/${threadId}/${this.bridgeId}`,
      {
        headers: {
          pauthkey: this.authKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return response?.data;
  }

  async sendMessage(message: string, threadId?: string, variables = {}) {
    const response: AxiosResponse<any> = await axios.post('https://routes.msg91.com/api/proxy/1258584/29gjrmh24/api/v2/model/chat/completion',
      {
        user: message,
        variables: variables,
        bridge_id: this.bridgeId,
        thread_id: threadId,
        RTLayer: false,
        response_type: this.responseType,
        "configuration": {
          "model": this.model,
        },
        "service": this.service,
      },
      {
        headers: {
          pauthkey: this.authKey,
        },
      }
    );
    return response.data?.response?.data?.content || null;
  }

  async createMessage(threadId: string, message: string) {
    const response: AxiosResponse<any> = await axios.post(
      `https://proxy.viasocket.com/proxy/api/1258584/32nghul25/api/v1/config/threads/${threadId}/${this.bridgeId}`,
      {
        "message": message
      },
      {
        headers: {
          pauthkey: this.authKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return response?.data;
  }
}

export const ServiceSchema = z.enum(['openai', 'groq', 'anthropic']);
type Service = z.infer<typeof ServiceSchema>;

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
// type GroqModel = "llama-3.1-70b-versatile" | "llama-3.1-8b-instant" | "llama3-groq-70b-8192-tool-use-preview" | "llama3-groq-8b-8192-tool-use-preview" | "llama3-70b-8192" | "llama3-8b-8192" | "mixtral-8x7b-32768" | "gemma-7b-it" | "gemma2-9b-it";
export const OpenAIModelSchema = z.enum([
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4o',
  'chatgpt-4o-latest',
  'gpt-4o-mini'
]);
export type OpenAIModel = z.infer<typeof OpenAIModelSchema>;
// type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o' | 'chatgpt-4o-latest' | 'gpt-4o-mini';
export const AnthropicModelSchema = z.enum([
  'claude-3.5-sonnet-20240620',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-2024307'
]);
export type AnthropicModel = z.infer<typeof AnthropicModelSchema>;
// type AnthropicModel = 'claude-3.5-sonnet-20240620' | 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-2024307';
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

export class AIMiddlewareBuilder {
  private authKey: string;
  private rtlayer: boolean;
  private bridgeId: string;
  private responseType: string;
  private model: string;
  private service: Service;

  constructor(authKey: string) {
    this.authKey = authKey;
    this.rtlayer = false;
    this.bridgeId = "6733097358507028fd81de16";
    this.responseType = 'text';
    this.model = 'gpt-4o';
    this.service = 'openai';
  }
  useService(service: Service, model: OpenAIModel | GroqModel | AnthropicModel) {
    if (!service || !model) return this;
    this.service = service;
    this.model = model;
    return this;
  }
  useOpenAI(model: OpenAIModel) {
    this.service = 'openai';
    this.model = model;
    return this;
  }
  useGroq(model: GroqModel) {
    this.service = 'groq';
    this.model = model;
    return this;
  }
  useAnthropic(model: AnthropicModel) {
    this.service = 'anthropic';
    this.model = model;
    return this;
  }
  useRTLayer(rtlayer: boolean) {
    this.rtlayer = rtlayer;
    return this;
  }
  useBridge(bridgeId: string) {
    this.bridgeId = bridgeId;
    return this;
  }
  useResponseType(responseType: string) {
    this.responseType = responseType;
    return this;
  }
  build() {
    ModelSchema.parse({ service: this.service, model: this.model });
    return new AIMiddleware(this.authKey, this.bridgeId, this.responseType, this.model, this.service, this.rtlayer);
  }
}