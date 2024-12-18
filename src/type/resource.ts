import { z } from "zod";

export const ResourceSchema = z.object({
  // Required fields
  title: z.string(),
  agentId: z.string(), // MongoDB ObjectId as string
  createdBy: z.string(), // MongoDB ObjectId as string

  // Optional fields
  content: z.string().optional(),
  url: z.string().url().optional(),
  metadata: z.record(z.any()).optional(), 
  
  // Timestamp fields that Mongoose adds automatically
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type inference
export type Resource = z.infer<typeof ResourceSchema>;