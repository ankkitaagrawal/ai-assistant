import { z } from "zod";

export const ResourceSchema = z.object({
  // Required fields
  title: z.string(),
  agentId: z.string(), // MongoDB ObjectId as string
  createdBy: z.string(), // MongoDB ObjectId as string
  public: z.boolean().default(false),

  // Optional fields
  content: z.string().optional(),
  refreshedAt: z.date().optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Type inference
export type Resource = z.infer<typeof ResourceSchema>;