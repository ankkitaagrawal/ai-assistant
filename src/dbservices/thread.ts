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

const userAssistantThreadKey = (userId: string, assistantId: string = "all") => `assistant:thread:user:${userId}:assistant:${assistantId}`;

const threadKey = (threadId: string) => `assistant:thread:${threadId}`;

export async function createThread(data: ThreadData): Promise<ThreadData> {
  data = ThreadDataSchema.parse(data);
  redis.del(userAssistantThreadKey(data.createdBy, data.agent));
  const thread = new Thread(data);
  return await thread.save();
}

export async function getUserThreads(userId: string, assistantId?: string): Promise<ThreadData[]> {
  if (!userId) throw new Error("User ID is required");
  const cachedThreads = await redis.cget(userAssistantThreadKey(userId, assistantId)).catch((error) => null);
  if (cachedThreads) return JSON.parse(cachedThreads);
  const filter = { createdBy: userId } as any;
  if (assistantId) filter.agent = assistantId;
  const userThreads = await Thread.find(filter).sort({ createdAt: -1 });
  redis.cset(userAssistantThreadKey(userId, assistantId), JSON.stringify(userThreads));
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
  redis.del(userAssistantThreadKey(thread.createdBy, thread.agent));
  return thread;
}

export async function searchThreads(agentId: string, query: string): Promise<ThreadData[]> {
  if (!query) throw new Error("Query is required");
  const threads = await Thread.find({
    agent: agentId,
    $text: { $search: query },
  });
  return threads;
}