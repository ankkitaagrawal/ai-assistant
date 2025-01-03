import env from "../config/env";
import { AIMiddlewareBuilder } from "../utility/aimiddleware";

type PersonalInfoCheckResult = {
    isPersonalInformation: "true" | "false";
    information: string;
    isPublic:  "true" | "false";
};
export async function checkIfUserGiveAnyPersonalInformation( message: string , ): Promise<PersonalInfoCheckResult> {
    const aiMiddlewareBuilder = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY);
    const diaryModel = aiMiddlewareBuilder.useOpenAI("gpt-3.5-turbo").useBridge("677690878e065843d7cd7289").build();
    const response = await diaryModel.sendMessage(message);
    return JSON.parse(response);
}
