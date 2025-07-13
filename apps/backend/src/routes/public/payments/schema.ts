import { z } from "zod";

export const startPaymentSchema = z.object({
  body: z.object({
    profileId: z.string().uuid("Invalid profile ID"),
    amount: z.number(),
    email: z.string().email("Invalid email"),
  }),
});

export type StartPaymentInput = z.infer<typeof startPaymentSchema>["body"];
