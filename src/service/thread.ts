import env from "../config/env";
import { AIMiddlewareBuilder } from "../utility/aimiddleware";

export async function generateThreadName(threadId: string, message: string, response: string): Promise<string> {
    const aiMiddlewareBuilder = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY);
    const namingModel = aiMiddlewareBuilder.useOpenAI("gpt-4-turbo").useBridge("6758354ff2bb1d19ee083e92").build();
    const prompt = `User: ${message} \n Assistant: ${response}`;
    const name = await namingModel.sendMessage(prompt);
    return name;
}
