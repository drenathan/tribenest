import { createAccountSchema } from "@src/routes/accounts/schema";
import z from "zod";

export const createPublicAccountSchema = z.object({
  body: z.object({
    ...createAccountSchema.shape.body.shape,
    profileId: z.string().uuid(),
    membershipTierId: z.string().uuid().optional(),
  }),
});

export type CreatePublicAccountInput = z.infer<typeof createPublicAccountSchema>["body"];
