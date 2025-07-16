import { PaymentProviderName } from "@src/services/paymentProvider/PaymentProvider";
import { z } from "zod";

export const createOrderSchema = z.object({
  body: z
    .object({
      paymentId: z.string(),
      paymentProviderName: z.nativeEnum(PaymentProviderName),
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
              title: z.string(),
              coverImage: z.string().optional(),
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

export const finalizeOrderSchema = z.object({
  body: z.object({
    paymentId: z.string(),
    paymentProviderName: z.nativeEnum(PaymentProviderName),
    profileId: z.string().uuid("Invalid profile ID"),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];
export type FinalizeOrderInput = z.infer<typeof finalizeOrderSchema>["body"];
