import axios, { AxiosResponse } from "axios"

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


enum Service {
  OPENAI = 'openai',
  GROQ = 'groq',
  ANTHROPIC = 'anthropic',
}

type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o' | 'chatgpt-4o-latest' | 'gpt-4o-mini';
type AnthropicModel = 'claude-3.5-sonnet-20240620' | 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-2024307';
export class AIMiddlewareBuilder {
  private authKey: string;
  private rtlayer: boolean;
  private bridgeId: string;
  private responseType: string;
  private model: string;
  private service: string;

  constructor(authKey: string) {
    this.authKey = authKey;
    this.rtlayer = false;
    this.bridgeId = "6733097358507028fd81de16";
    this.responseType = 'text';
    this.model = 'gpt-4o';
    this.service = 'openai';
  }
  useOpenAI(model: OpenAIModel) {
    this.service = Service.OPENAI;
    this.model = model;
    return this;
  }
  useAnthropic(model: AnthropicModel) {
    this.service = Service.ANTHROPIC;
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
    return new AIMiddleware(this.authKey, this.bridgeId, this.responseType, this.model, this.service, this.rtlayer);
  }
}