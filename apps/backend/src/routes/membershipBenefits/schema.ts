import { z } from "zod";

export const getMembershipBenefitsSchema = z.object({
  query: z.object({
    profileId: z.string(),
  }),
});

export type GetMembershipBenefitsInput = z.infer<typeof getMembershipBenefitsSchema>["query"];

export const createMembershipBenefitSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(100),
    description: z.union([z.literal(""), z.string().min(10).max(1000)]).optional(),
    profileId: z.string().uuid(),
  }),
});

export type CreateMembershipBenefitInput = z.infer<typeof createMembershipBenefitSchema>["body"];
