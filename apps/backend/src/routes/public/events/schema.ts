import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    profileId: z.string().uuid("Invalid profile ID"),
    email: z.string().email("Invalid email"),
    firstName: z.string(),
    lastName: z.string(),
    items: z.record(
      z.string().uuid("Invalid ticket ID"),
      z.number().int().positive("Quantity must be a positive integer"),
    ),
  }),
});

export const finalizeOrderSchema = z.object({
  body: z.object({
    profileId: z.string().uuid("Invalid profile ID"),
    orderId: z.string().uuid("Invalid order ID"),
  }),
});

export const validateEventPassSchema = z.object({
  body: z.object({
    broadcastId: z.string().uuid("Invalid broadcast ID"),
    eventPassId: z.string().regex(/^TN-/, "Invalid event pass ID"),
    sessionId: z.string().optional(),
  }),
});

export type ValidateEventPassInput = z.infer<typeof validateEventPassSchema>["body"];

export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];
export type FinalizeOrderInput = z.infer<typeof finalizeOrderSchema>["body"];
