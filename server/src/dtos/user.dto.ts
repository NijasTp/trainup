import { z } from "zod";

export const CreateUserDTO = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});
export type ICreateUserDTO = z.infer<typeof CreateUserDTO>;
