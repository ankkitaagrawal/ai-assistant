import { Thread } from "../models/thread"
import redis from "../config/redis";
import { z } from "zod";

const ThreadDataSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  middleware_id: z.string(),
  agent: z.string(),
  createdBy: z.string(),
});

type ThreadData = z.infer<typeof ThreadDataSchema>;


const userThreadKey = (userId: string) => `assistant:thread:user:${userId}`;
const threadKey = (threadId: string) => `assistant:thread:${threadId}`;

export async function createThread(data: ThreadData): Promise<ThreadData> {
  data = ThreadDataSchema.parse(data);
  redis.del(userThreadKey(data.createdBy));
  const thread = new Thread(data);
  return await thread.save();
}

export async function getUserThreads(userId: string): Promise<ThreadData[]> {
  if (!userId) throw new Error("User ID is required");
  const cachedThreads = await redis.cget(userThreadKey(userId)).catch((error) => null);
  if (cachedThreads) return JSON.parse(cachedThreads);
  const userThreads = await Thread.find({ createdBy: userId }).sort({ createdAt: -1 });
  redis.cset(userThreadKey(userId), JSON.stringify(userThreads));
  return userThreads;
}

export async function getThreadById(threadId: string): Promise<ThreadData | undefined> {
  if (!threadId) throw new Error("Thread ID is required");
  const cacheKey = threadKey(threadId);
  const cachedThreads = await redis.cget(cacheKey).catch((error) => null);
  if (cachedThreads) return JSON.parse(cachedThreads);
  const thread = await Thread.findById(threadId);
  redis.cset(cacheKey, JSON.stringify(thread));
  return thread;
}

export async function updateThreadName(threadId: string, name: string): Promise<ThreadData | undefined> {
  if (!threadId) throw new Error("Thread ID is required");
  const thread = await Thread.findByIdAndUpdate(threadId, { name }, { new: true });
  // Clear cache
  redis.del(threadKey(threadId));
  redis.del(userThreadKey(thread.createdBy));
  return thread;
}