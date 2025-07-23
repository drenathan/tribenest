import { z } from "zod";
import { paginationSchema, profileIdQuerySchema } from "../schema";

export const getEmailsSchema = z.object({
  query: z.object({
    profileId: z.string(),
    ...paginationSchema.shape,
  }),
});

export const createEmailSchema = z.object({
  body: z.object({
    profileId: z.string(),
    emailListId: z.string().uuid().optional(),
    recipient: z.string().email().optional(),
    subject: z.string().min(5),
    emailTemplateId: z.string().uuid(),
    sendDate: z.date().optional(),
  }),
});

export const getEmailListsSchema = z.object({
  query: z.object({
    profileId: z.string(),
    ...paginationSchema.shape,
  }),
});

export const getEmailTemplatesSchema = z.object({
  query: z.object({
    profileId: z.string(),
    ...paginationSchema.shape,
  }),
});

export const createEmailListSchema = z.object({
  body: z.object({
    profileId: z.string(),
    title: z.string().min(5),
    isDefault: z.boolean().optional(),
  }),
});

export const createEmailTemplateSchema = z.object({
  body: z.object({
    profileId: z.string(),
    title: z.string().min(5),
    content: z.string().default("{}"),
    config: z.string().default("{}"),
  }),
});

export const getEmailTemplateSchema = profileIdQuerySchema;
export const getEmailSchema = profileIdQuerySchema;
export const getEmailListSchema = profileIdQuerySchema;

export type GetEmailsInput = z.infer<typeof getEmailsSchema>["query"];
export type GetEmailListsInput = z.infer<typeof getEmailListsSchema>["query"];
export type GetEmailTemplatesInput = z.infer<typeof getEmailTemplatesSchema>["query"];
export type CreateEmailListInput = z.infer<typeof createEmailListSchema>["body"];
export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>["body"];
export type CreateEmailInput = z.infer<typeof createEmailSchema>["body"];
export type GetEmailListInput = z.infer<typeof getEmailListSchema>["query"];
export type GetEmailTemplateInput = z.infer<typeof getEmailTemplateSchema>["query"];
export type GetEmailInput = z.infer<typeof getEmailSchema>["query"];
