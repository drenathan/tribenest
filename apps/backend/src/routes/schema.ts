import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  filter: z.record(z.string(), z.any()).optional(),
});

export const paginationQuerySchema = z.object({
  query: paginationSchema,
});

export const profileIdQuerySchema = z.object({
  query: z.object({
    profileId: z.string().uuid("Invalid profile ID"),
  }),
});

export type PaginationInput = z.infer<typeof paginationQuerySchema>["query"];
export type ProfileIdInput = z.infer<typeof profileIdQuerySchema>["query"];
