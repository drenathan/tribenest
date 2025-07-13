import { z } from "zod";

const createProfileSchema = z.object({
  body: z.object({
    subdomain: z
      .string()
      .min(4, "Subdomain is too short, should be at least 3 characters")
      .max(50, "Subdomain is too long")
      .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, "Subdomain is invalid"),
    name: z.string().min(4, "Name is too short, should be at least 3 characters").max(50, "Name is too long"),
  }),
});
const validateSubdomainSchema = z.object({
  body: z.object({
    subdomain: z
      .string()
      .min(4, "Subdomain is too short, should be at least 3 characters")
      .max(50, "Subdomain is too long")
      .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, "Subdomain is invalid"),
  }),
});

const uploadMediaSchema = z.object({
  body: z.object({
    url: z.string().url(),
    type: z.enum(["image", "video", "audio", "document"]),
    parent: z.enum(["posts", "website"]),
    name: z.string().optional(),
    size: z.number(),
  }),
});

const getMediaSchema = z.object({
  query: z.object({
    parent: z.enum(["posts", "website"]),
    type: z.enum(["image", "video", "audio", "document"]),
  }),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>["body"];
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>["body"];
export type GetMediaInput = z.infer<typeof getMediaSchema>["query"];
export type ValidateSubdomainInput = z.infer<typeof validateSubdomainSchema>["body"];

export { createProfileSchema, uploadMediaSchema, getMediaSchema, validateSubdomainSchema };
