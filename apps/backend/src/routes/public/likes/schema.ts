import { z } from "zod";

export const likeSchema = z.object({
  body: z.object({
    entityId: z.string().uuid("Invalid entity ID"),
    entityType: z.string().min(1, "Entity type is required"),
  }),
});

export const likeStatusSchema = z.object({
  query: z.object({
    entityId: z.string().uuid("Invalid entity ID"),
    entityType: z.string().min(1, "Entity type is required"),
  }),
});

export const likeCountSchema = z.object({
  query: z.object({
    entityId: z.string().uuid("Invalid entity ID"),
    entityType: z.string().min(1, "Entity type is required"),
  }),
});

export type LikeInput = z.infer<typeof likeSchema>["body"];
export type LikeStatusInput = z.infer<typeof likeStatusSchema>["query"];
export type LikeCountInput = z.infer<typeof likeCountSchema>["query"];
