import { Thread } from "../models/thread"

import { z } from "zod";

const ThreadDataSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  middleware_id: z.string(),
  agent: z.string(),
  createdBy: z.string(),
});

type ThreadData = z.infer<typeof ThreadDataSchema>;

export async function createThread(data: ThreadData): Promise<ThreadData> {
  data = ThreadDataSchema.parse(data);
  const thread = new Thread(data);
  return await thread.save();
}

export async function getUserThreads(userId: string): Promise<ThreadData[]> {
  if (!userId) throw new Error("User ID is required");
  return await Thread.find({ createdBy: userId }).sort({ createdAt: -1 });;
}

export async function getThreadById(threadId: string): Promise<ThreadData | undefined> {
  if (!threadId) throw new Error("Thread ID is required");
  return await Thread.findById(threadId);
}

export async function updateThreadName(threadId: string, name: string): Promise<ThreadData | undefined> {
  if (!threadId) throw new Error("Thread ID is required");
  return await Thread.findByIdAndUpdate(threadId, { name }, { new: true });
}