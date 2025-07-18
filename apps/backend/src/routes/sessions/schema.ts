import { z } from "zod";

const createSessionSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>["body"];

export { createSessionSchema };
