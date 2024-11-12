import { z } from "zod";

export const userSchema = z.object({
    email: z.string().email(),
    phone: z.string().regex(/^\d{10}$/),
    gender: z.enum(["male", "female", "other"]),
    name: z.string(),
    id :z.number()
});

export type User = z.infer<typeof userSchema>;


declare global {
  namespace Express {
      interface Request {
        profile?: User;
      }
  }
}