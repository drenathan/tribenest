import { paginationSchema } from "@src/routes/schema";
import { z } from "zod";

export const getPostsSchema = z.object({
  query: z.object({
    profileId: z.string().uuid("Invalid profile ID"),
    type: z.enum(["image", "video", "audio", "poll"]).optional(),
    membershipTierId: z.string().uuid("Invalid membership tier ID").optional(),
    ...paginationSchema.shape,
  }),
});

export type GetPostsInput = z.infer<typeof getPostsSchema>["query"];
