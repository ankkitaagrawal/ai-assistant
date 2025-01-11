import AgentService from "../dbservices/agent";
import { createUser, getUserDetailsByProxyId, updateUserAgent, updateUserDetails } from "../dbservices/user";
import { User } from "../type/user";
import { getProxyUser } from "./proxy";

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
        // Get user detail from proxy and save in db
        const proxyUser = await getProxyUser(proxyId);
        const name = proxyUser?.name;
        const email = proxyUser?.email;
        user = await createUser({ proxyId, name, email }) as User;
        let agent = await AgentService.createAgent({ createdBy: user?._id?.toString() as any, name, bridgeId: "6733097358507028fd81de16", llm: { service: "openai", model: "gpt-4o" } }).catch((error) => {
            console.error('Error in creating agent', error);
            return null;
        });
        user = await updateUserAgent({ userId: user._id as any, agentId: agent?._id as any }) as User;
    }
    if (user?._id && !user?.email) {
        const proxyUser = await getProxyUser(proxyId);
        const email = proxyUser?.email;
        user = await updateUserDetails(user?._id?.toString(), { email }) as User;
    }
    return user;
}