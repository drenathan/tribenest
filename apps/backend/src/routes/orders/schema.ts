import { z } from "zod";
import { paginationSchema } from "../schema";

export const getOrdersSchema = z.object({
  query: z.object({
    profileId: z.string(),
    ...paginationSchema.shape,
  }),
});
export const getOrderSchema = z.object({
  query: z.object({
    profileId: z.string(),
  }),
});

export type GetOrdersInput = z.infer<typeof getOrdersSchema>["query"];
export type GetOrderInput = z.infer<typeof getOrderSchema>["query"];
