import { z } from "zod";

export const userSchema = z.object({
    email: z.string().email(),
    phone: z.string().regex(/^\d{10}$/),
    gender: z.enum(["male", "female", "other"]),
    name: z.string(),
});

export type User = z.infer<typeof userSchema>;
