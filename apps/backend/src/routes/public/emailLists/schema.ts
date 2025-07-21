import { z } from "zod";

export const joinEmailListSchema = z.object({
  body: z.object({
    profileId: z.string().uuid("Invalid entity ID"),
    emailListId: z.string().optional(),
    email: z.string().email("Invalid email"),
  }),
});

export const unsubscribeFromEmailListSchema = z.object({
  query: z.object({
    subscriberId: z.string().optional(),
  }),
});

export type JoinEmailListInput = z.infer<typeof joinEmailListSchema>["body"];

export type UnsubscribeFromEmailListInput = z.infer<typeof unsubscribeFromEmailListSchema>["query"];
