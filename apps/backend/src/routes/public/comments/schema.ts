import { z } from "zod";

export const commentSchema = z.object({
  body: z.object({
    entityId: z.string().uuid("Invalid entity ID"),
    entityType: z.string().min(1, "Entity type is required"),
    content: z.string().min(1, "Comment content is required").max(1000, "Comment too long"),
  }),
});

export const commentListSchema = z.object({
  query: z.object({
    entityId: z.string().uuid("Invalid entity ID"),
    entityType: z.string().min(1, "Entity type is required"),
    page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  }),
});

export const commentCountSchema = z.object({
  query: z.object({
    entityId: z.string().uuid("Invalid entity ID"),
    entityType: z.string().min(1, "Entity type is required"),
  }),
});

export type CommentInput = z.infer<typeof commentSchema>["body"];
export type CommentListInput = z.infer<typeof commentListSchema>["query"];
export type CommentCountInput = z.infer<typeof commentCountSchema>["query"];
