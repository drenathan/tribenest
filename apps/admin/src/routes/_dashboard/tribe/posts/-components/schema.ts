import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const createPostSchema = z.object({
  caption: z
    .string()
    .min(5, "Caption must be at least 5 characters")
    .max(1000, "Caption must be less than 1000 characters"),
  mediaLink: z.string().optional(),
  mediaSize: z.number().optional(),
  type: z.enum(["image", "video", "audio", "poll"], {
    errorMap: () => ({ message: "Please select a post type" }),
  }),
  membershipTiers: z.array(z.string()).optional(),
  profileId: z.string().min(1).optional(),
});

export const updatePostSchema = z.object({
  caption: z
    .string()
    .min(5, "Caption must be at least 5 characters")
    .max(1000, "Caption must be less than 1000 characters"),
  membershipTiers: z.array(z.string()).optional(),
  profileId: z.string().min(1).optional(),
  postId: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export const createPostResolver = zodResolver(createPostSchema);
export const updatePostResolver = zodResolver(updatePostSchema);
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
