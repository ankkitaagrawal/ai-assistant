import AgentService from "../dbservices/agent";
import { createUser, getUserDetailsByProxyId, updateUserAgent } from "../dbservices/user";
import { User } from "../type/user";
import { getUserByEmailId } from "./channel";

export function delay(time = 1000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            return resolve(true);
        }, time)
    });
}

export async function getUserDetail(proxyId: string, email: string): Promise<User> {
    let user = await getUserDetailsByProxyId(proxyId).catch((error) => null) as User;
    if (!user) {
        // Get user detail from channel and save in db
        const channelUser = await getUserByEmailId(email);
        const name = channelUser?.title;
        const channelId = channelUser?.userId;
        user = await createUser({ proxyId, channelId, name }) as User;
        let agent = await AgentService.createAgent({ createdBy: user?._id?.toString() as any, name, bridgeId: "6733097358507028fd81de16", llm: { service: "openai", model: "gpt-4o" } }).catch((error) => {
            console.error('Error in creating agent', error);
            return null;
        });
        user = await updateUserAgent({ userId: user._id as any, agentId: agent?._id as any }) as User;
    }
    return user;
}