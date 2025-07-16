import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const createMembershipTierSchema = z
  .object({
    name: z.string().min(5).max(100),
    description: z.string().min(10).max(1000),
    priceMonthly: z.string().optional(),
    priceYearly: z.string().optional(),
    payWhatYouWant: z.boolean().optional(),
    payWhatYouWantMinimum: z.string().optional(),
    payWhatYouWantMaximum: z.string().optional(),
    profileId: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.payWhatYouWant && !data.payWhatYouWantMinimum) {
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
  )
  .refine((data) => (data.payWhatYouWant ? true : data.priceMonthly && Number(data.priceMonthly) > 0), {
    path: ["priceMonthly"],
    message: "Price Monthly must be greater than 0",
  })
  .refine((data) => (data.payWhatYouWant || !data.priceYearly ? true : Number(data.priceYearly) > 0), {
    path: ["priceYearly"],
    message: "Price Yearly must be greater than 0",
  })
  .refine(
    (data) => (data.payWhatYouWant ? data.payWhatYouWantMinimum && Number(data.payWhatYouWantMinimum) > 0 : true),
    {
      path: ["payWhatYouWantMinimum"],
      message: "Pay What You Want Minimum must be greater than 0",
    },
  )
  .refine(
    (data) => (data.payWhatYouWant && data.payWhatYouWantMaximum ? Number(data.payWhatYouWantMaximum) > 0 : true),
    {
      path: ["payWhatYouWantMaximum"],
      message: "Pay What You Want Maximum must be greater than 0",
    },
  );

export const createMembershipBenefitSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  profileId: z.string().optional(),
});

export type CreateMembershipTierInput = z.infer<typeof createMembershipTierSchema>;
export type CreateMembershipBenefitInput = z.infer<typeof createMembershipBenefitSchema>;
export const createMembershipTierResolver = zodResolver(createMembershipTierSchema);
export const createMembershipBenefitResolver = zodResolver(createMembershipBenefitSchema);
