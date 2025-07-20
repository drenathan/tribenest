import { createAccountSchema } from "@src/routes/accounts/schema";
import z from "zod";

export const createPublicAccountSchema = z.object({
  body: z.object({
    ...createAccountSchema.shape.body.shape,
    profileId: z.string().uuid(),
    membershipTierId: z.string().uuid().optional(),
  }),
});

export const updatePublicAccountSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
});

export const updatePublicAccountPasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string(),
    newPassword: z.string(),
  }),
});

export type CreatePublicAccountInput = z.infer<typeof createPublicAccountSchema>["body"];
export type UpdatePublicAccountInput = z.infer<typeof updatePublicAccountSchema>["body"];
export type UpdatePublicAccountPasswordInput = z.infer<typeof updatePublicAccountPasswordSchema>["body"];
export type UpdatePublicAccountSchema = z.infer<typeof updatePublicAccountSchema>["body"];
