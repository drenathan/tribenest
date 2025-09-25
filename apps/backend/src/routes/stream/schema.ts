import { z } from "zod";
import { paginationSchema } from "../schema";

export const getStreamTemplatesSchema = z.object({
  query: z.object({
    profileId: z.string().uuid(),
    ...paginationSchema.shape,
  }),
});

export const createStreamTemplateSchema = z.object({
  body: z.object({
    profileId: z.string().uuid(),
    title: z.string(),
    description: z.string().optional(),
    config: z.record(z.string(), z.any()),
    scenes: z.array(z.record(z.string(), z.any())),
  }),
});

export const updateStreamTemplateSchema = z.object({
  body: z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().optional(),
    config: z.record(z.string(), z.any()),
    scenes: z.array(z.record(z.string(), z.any())),
  }),
});

export type UpdateStreamTemplateInput = z.infer<typeof updateStreamTemplateSchema>["body"];

export type GetStreamTemplatesInput = z.infer<typeof getStreamTemplatesSchema>["query"];
export type CreateStreamTemplateInput = z.infer<typeof createStreamTemplateSchema>["body"];
