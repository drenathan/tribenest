import { z } from "zod";

export const getMembershipTiersSchema = z.object({
  query: z.object({
    profileId: z.string(),
  }),
});

export type GetMembershipTiersInput = z.infer<typeof getMembershipTiersSchema>["query"];

export const createMembershipTierSchema = z.object({
  body: z
    .object({
      name: z.string().min(5).max(100),
      description: z.string().min(10).max(1000),
      priceMonthly: z.coerce.number().min(1).optional(),
      priceYearly: z.coerce.number().min(1).optional(),
      payWhatYouWant: z.boolean().optional(),
      payWhatYouWantMinimum: z.coerce.number().min(1).optional(),
      payWhatYouWantMaximum: z.coerce.number().min(1).optional(),
      profileId: z.string(),
    })
    .refine(
      (data) => {
        if (data.payWhatYouWant && (!data.payWhatYouWantMinimum || data.payWhatYouWantMinimum < 1)) {
          return false;
        }
        return true;
      },
      { path: ["payWhatYouWantMinimum"], message: "Pay What You Want Minimum is required" },
    )
    .refine(
      (data) => {
        if (!data.payWhatYouWant && !data.priceMonthly) {
          return false;
        }
        return true;
      },
      { path: ["priceMonthly"], message: "Price Monthly is required" },
    ),
});

export const updateMembershipTierBenefitsSchema = z.object({
  body: z.object({
    benefits: z.array(z.string()),
    profileId: z.string(),
  }),
});

export type UpdateMembershipTierBenefitsInput = z.infer<typeof updateMembershipTierBenefitsSchema>["body"];

export type CreateMembershipTierInput = z.infer<typeof createMembershipTierSchema>["body"];
