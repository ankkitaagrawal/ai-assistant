import { createUser, getUserDetailsByProxyId } from "../dbservices/user";
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
        user = await createUser({ proxyId, channelId: channelUser?.userId, name: channelUser?.title }) as User;
    }
    return user;
}