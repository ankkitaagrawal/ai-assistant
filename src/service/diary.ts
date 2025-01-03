import env from "../config/env";
import { AIMiddlewareBuilder } from "../utility/aimiddleware";

type UpdateDiary = {
    content: string;
    visibility: "public" | "private";
};
export async function updateDiary(message: string, headingName: string, context?: string): Promise<UpdateDiary> {
    const aiMiddlewareBuilder = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY);
    const diaryModel = aiMiddlewareBuilder.useOpenAI("gpt-3.5-turbo").useBridge("677690878e065843d7cd7289").build();
    const response = await diaryModel.sendMessage(message, undefined, { headingName, context, message });
    return JSON.parse(response);
}
