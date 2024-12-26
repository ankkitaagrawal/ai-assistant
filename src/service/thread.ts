import env from "../config/env";
import rtlayer from "../config/rtlayer";
import { updateThreadName } from "../dbservices/thread";
import { AIMiddlewareBuilder } from "../utility/aimiddleware";

export async function createThreadName(threadId: string, message: string, response: string): Promise<void> {
    const aiMiddlewareBuilder = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY);
    const namingModel = aiMiddlewareBuilder.useOpenAI("gpt-4-turbo").useBridge("6758354ff2bb1d19ee083e92").build();
    
    const prompt = `User: ${message} \n Assistant: ${response}`;
    const name = await namingModel.sendMessage(prompt);
    await updateThreadName(threadId, name);
    rtlayer.message( JSON.stringify({ name : name } ) ,{
                channel : threadId
    });
}
