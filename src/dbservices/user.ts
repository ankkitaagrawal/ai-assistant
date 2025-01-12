import redis from "../config/redis";
import userModel from "../models/users";
import { User } from "../type/user";

const proxyUserKey = (proxyId: string) => `user:proxy:${proxyId}`;
export async function getUserDetailsByProxyId(proxyId: string): Promise<User> {
   const cacheKey = proxyUserKey(proxyId);
   const cachedResource = await redis.cget(cacheKey).catch((error) => null);
   if (cachedResource) {
      return JSON.parse(cachedResource);
   }
   const user = await userModel.findOne({ proxyId: proxyId }).lean() as User;
   redis.cset(cacheKey, JSON.stringify(user));
   return user;
}

export async function createUser(user: { proxyId: string, [key: string]: any }) {
   const result = await userModel.create({
      ...user
   });
   return result.toObject();
}
export async function updateUserDetails(id: string, user: Partial<User>) {
   delete user._id;
   delete user?.agent;
   delete user?.proxyId;
   const newUser = await userModel.findByIdAndUpdate(id, {
      $set: user
   }, { new: true }).lean() as User;
   const cacheKey = proxyUserKey(newUser?.proxyId as string);
   redis.del(cacheKey);
   return newUser;
}


export async function updateUserAgent({ userId, agentId }: { userId: string, agentId: string }) {
   const user = await userModel.findByIdAndUpdate(userId, {
      $set: { agent: agentId }
   }, { new: true }).lean();
   const cacheKey = proxyUserKey(user?.proxyId as string);
   redis.del(cacheKey);
   return user;
}

export async function getUserByEmailId(email: string) {
   const user = await userModel.findOne({ email }).lean() as User;
   return user;
}

