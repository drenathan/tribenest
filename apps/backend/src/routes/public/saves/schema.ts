import { z } from "zod";

export const saveSchema = z.object({
  body: z.object({
    entityId: z.string().uuid("Invalid entity ID"),
    entityType: z.string().min(1, "Entity type is required"),
  }),
});

export const saveStatusSchema = z.object({
  query: z.object({
    entityId: z.string().uuid("Invalid entity ID"),
    entityType: z.string().min(1, "Entity type is required"),
  }),
});

export const saveCountSchema = z.object({
  query: z.object({
    entityId: z.string().uuid("Invalid entity ID"),
    entityType: z.string().min(1, "Entity type is required"),
  }),
});

export type SaveInput = z.infer<typeof saveSchema>["body"];
export type SaveStatusInput = z.infer<typeof saveStatusSchema>["query"];
export type SaveCountInput = z.infer<typeof saveCountSchema>["query"];
