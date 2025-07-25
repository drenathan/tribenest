import { z } from "zod";

export const startPaymentSchema = z.object({
  body: z
    .object({
      profileId: z.string().uuid("Invalid profile ID"),
      accountId: z.string().uuid("Invalid account ID").optional(),
      amount: z.number(),
      email: z.string().email("Invalid email").optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      cartItems: z
        .array(
          z
            .object({
              productId: z.string().uuid("Invalid product ID"),
              quantity: z.number().int().positive("Quantity must be a positive integer"),
              productVariantId: z.string().uuid("Invalid product variant ID"),
              price: z.number(),
              isGift: z.boolean().optional(),
              recipientName: z.string().optional(),
              recipientEmail: z.string().email("Invalid email").optional(),
              recipientMessage: z.string().optional(),
              payWhatYouWant: z.boolean().optional(),
            })
            .refine(
              (data) => {
                if (data.isGift) {
                  return data.recipientName && data.recipientEmail;
                }
                return true;
              },
              {
                message: "Recipient name and email are required for gifts",
              },
            ),
        )
        .min(1, "Cart items must be at least 1"),
    })
    .refine(
      (data) => {
        if (!data.accountId) {
          return data.firstName && data.lastName && data.email;
        }
        return true;
      },
      {
        message: "First name, last name and email are required for guest payments",
      },
    ),
});

export const finalizePaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().uuid("Invalid payment ID"),
    paymentProviderName: z.string().uuid("Invalid payment provider name"),
    profileId: z.string().uuid("Invalid profile ID"),
    accountId: z.string().uuid("Invalid account ID"),
  }),
});

export const createSubscriptionSchema = z.object({
  body: z.object({
    amount: z.number(),
    billingCycle: z.enum(["month", "year"]),
    profileId: z.string().uuid("Invalid profile ID"),
    membershipTierId: z.string().uuid("Invalid membership tier ID"),
    isChange: z.boolean().optional(),
  }),
});

export const cancelSubscriptionSchema = z.object({
  body: z.object({
    profileId: z.string().uuid("Invalid profile ID"),
    membershipId: z.string().uuid("Invalid membership ID"),
  }),
});

export type StartPaymentInput = z.infer<typeof startPaymentSchema>["body"];
export type FinalizePaymentInput = z.infer<typeof finalizePaymentSchema>["body"];
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>["body"];
