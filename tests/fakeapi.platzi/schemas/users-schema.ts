import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
  role: z.string(),
  avatar: z.string().url(),
});

export const UsersSchema = z.array(UserSchema);
