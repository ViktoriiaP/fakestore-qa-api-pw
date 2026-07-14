import { z } from "zod";

export const UpdateUserSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().min(1).optional(),
    password: z.string().min(4).optional(),
    avatar: z.string().url().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );
