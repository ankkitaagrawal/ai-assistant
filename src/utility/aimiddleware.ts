import { AxiosResponse } from "axios";
import axios from "../config/axios";
import { z } from 'zod';
import env from "../config/env";
import { AnthropicModel, GroqModel, ModelSchema, OpenAIModel, Service } from "../type/ai_middleware";
import { getTool, Tool, ToolName } from "../type/tools";
import { sendAlert } from "./alert";

class AIMiddleware {
  private authKey: string;
  private rtlayer: boolean;
  private bridgeId: string;
  private responseType: string;
  private model: string;
  private service: string;
  private apiKey: string;
  private tools: Tool[];
  constructor(authKey: string, bridgeId: string, responseType: string, model: string, service: string, rtlayer: boolean = false, apiKey: string, tools: Tool[]) {
    this.authKey = authKey;
    this.rtlayer = rtlayer;
    this.bridgeId = bridgeId;
    this.responseType = responseType;
    this.model = model;
    this.service = service;
    this.apiKey = apiKey; // TODO: Temporary
    this.tools = tools;
  }

  async getMessages(threadId: string) {
    const response: AxiosResponse<any> = await axios.get(
      `https://proxy.viasocket.com/proxy/api/1258584/32nghul25/api/v1/config/get-message-history/${threadId}/${this.bridgeId}`,
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
    try {
      const response: AxiosResponse<any> = await axios.post('https://proxy.viasocket.com/proxy/api/1258584/29gjrmh24/api/v2/model/chat/completion',
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
          "apikey": this.apiKey,
          "extra_tools": this.tools
        },
        {
          headers: {
            pauthkey: this.authKey,
          },
        }
      );
      return response.data?.response?.data?.content || null;
    } catch (error: any) {
      console.log(error)
      sendAlert({ error: error?.response?.data, threadId });
      throw new Error(error?.response?.data?.detail?.error || error?.message);
    }

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

export class AIMiddlewareBuilder {
  private authKey: string;
  private rtlayer: boolean;
  private bridgeId: string;
  private responseType: string;
  private model: string;
  private service: Service;
  private tools: Tool[];

  constructor(authKey: string) {
    if (!authKey) throw new Error("Auth Key is required");
    this.authKey = authKey;
    this.rtlayer = false;
    this.bridgeId = "6733097358507028fd81de16";
    this.responseType = 'text';
    this.model = 'gpt-4o';
    this.service = 'openai';
    this.tools = [];
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
  addTool(toolName: ToolName, dynamicEnums?: { agentId?: string; userId?: string, threadId?: string }) {
    const tool = getTool(toolName, dynamicEnums);
    if (!tool) {
      throw new Error(`Tool "${toolName}" not found in the predefined tools.`);
    }
    this.tools.push(tool);
    return this;
  }

  build() {
    ModelSchema.parse({ service: this.service, model: this.model });
    // TODO: Temporary Start
    let apiKey = "";
    switch (this.service) {
      case 'openai':
        apiKey = env.OPENAI_API_KEY as string;
        break;
      case 'groq':
        apiKey = env.GROQ_API_KEY as string;
        break;
      case 'anthropic':
        apiKey = env.ANTHROPIC_API_KEY as string;
        break;
    }
    // TODO: Temporary End
    return new AIMiddleware(this.authKey, this.bridgeId, this.responseType, this.model, this.service, this.rtlayer, apiKey, this.tools);
  }
}