import { z } from "zod";
import { paginationSchema } from "../schema";

const themePageSchema = z.object({
  pathname: z.string(),
  json: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

const themeSettingsSchema = z.record(z.string(), z.any());

const activateThemeSchema = z.object({
  body: z.object({
    theme: z.object({
      pages: z.array(themePageSchema),
      themeSettings: themeSettingsSchema,
      slug: z.string(),
      version: z.string(),
      thumbnail: z.string(),
    }),
    profileId: z.string().uuid("Invalid profile ID"),
  }),
});

const updateWebsiteVersionSchema = z.object({
  body: z.object({
    pages: z.array(
      z.object({
        pathname: z.string(),
        content: z.string(),
        title: z.string(),
        description: z.string().optional(),
      }),
    ),
    themeSettings: themeSettingsSchema,
    profileId: z.string().uuid("Invalid profile ID"),
  }),
});

const getManySchema = z.object({
  query: z.object({
    profileId: z.string().uuid("Invalid profile ID"),
  }),
});

const getMessagesSchema = z.object({
  query: z.object({
    profileId: z.string().uuid("Invalid profile ID"),
    ...paginationSchema.shape,
  }),
});

export type ActivateThemeInput = z.infer<typeof activateThemeSchema>["body"];
export type GetManyWebsitesInput = z.infer<typeof getManySchema>["query"];
export type UpdateWebsiteVersionInput = z.infer<typeof updateWebsiteVersionSchema>["body"];
export type GetMessagesInput = z.infer<typeof getMessagesSchema>["query"];
export { activateThemeSchema, getManySchema, updateWebsiteVersionSchema, getMessagesSchema };
