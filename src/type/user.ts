import { z } from "zod";

export const userSchema = z.object({
  _id: z.string().optional(),
  proxyId: z.string(),
  channelId: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

