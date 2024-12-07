import { z } from "zod";

export const userSchema = z.object({
  proxyId: z.string(),
  channelId: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
}).nonstrict();

export type User = z.infer<typeof userSchema>;

