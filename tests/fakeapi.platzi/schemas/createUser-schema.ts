import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(4),
  avatar: z.string().url(),
});
