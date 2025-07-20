import { z } from "zod";
import { paginationSchema } from "../schema";

export const getMembershipsSchema = z.object({
  query: z.object({
    profileId: z.string(),
    ...paginationSchema.shape,
  }),
});
export const getMembershipSchema = z.object({
  query: z.object({
    profileId: z.string(),
  }),
});

export type GetMembershipsInput = z.infer<typeof getMembershipsSchema>["query"];
export type GetMembershipInput = z.infer<typeof getMembershipSchema>["query"];
