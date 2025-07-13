import { z } from "zod";
import { paginationSchema } from "../schema";

export const getPostsSchema = z.object({
  query: z.object({
    profileId: z.string(),
    ...paginationSchema.shape,
  }),
});
export const getPostSchema = z.object({
  query: z.object({
    profileId: z.string(),
  }),
});

export type GetPostsInput = z.infer<typeof getPostsSchema>["query"];
export type GetPostInput = z.infer<typeof getPostSchema>["query"];

export const createPostSchema = z.object({
  body: z.object({
    caption: z
      .string()
      .min(5, "Caption must be at least 5 characters")
      .max(1000, "Caption must be less than 1000 characters"),
    mediaLink: z.string(),
    mediaSize: z.number(),
    type: z.enum(["image", "video", "audio", "poll"], {
      errorMap: () => ({ message: "Please select a post type" }),
    }),
    membershipTiers: z.array(z.string()).optional().default([]),
    profileId: z.string().min(1),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    caption: z
      .string()
      .min(5, "Caption must be at least 5 characters")
      .max(1000, "Caption must be less than 1000 characters"),
    membershipTiers: z.array(z.string().uuid()).optional().default([]),
    profileId: z.string().min(1),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
