import { z } from "zod";
import { paginationSchema } from "../schema";

const themeSettingsSchema = z.record(z.string(), z.any());

export const createSmartLinkSchema = z.object({
  body: z.object({
    themeSettings: themeSettingsSchema,
    path: z.string(),
    template: z.string().optional(),
    thumbnail: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    content: z.string().default("{}"),
    profileId: z.string().uuid("Invalid profile ID"),
  }),
});

export const updateSmartLinkSchema = z.object({
  body: z.object({
    themeSettings: themeSettingsSchema,
    title: z.string(),
    description: z.string().optional(),
    content: z.string().default("{}"),
    path: z.string(),
    thumbnail: z.string().optional(),
  }),
});

export const getManySmartLinksSchema = z.object({
  query: z.object({
    ...paginationSchema.shape,
    profileId: z.string().uuid("Invalid profile ID"),
  }),
});

export type CreateSmartLinkInput = z.infer<typeof createSmartLinkSchema>["body"];
export type UpdateSmartLinkInput = z.infer<typeof updateSmartLinkSchema>["body"];
export type GetManySmartLinksInput = z.infer<typeof getManySmartLinksSchema>["query"];
