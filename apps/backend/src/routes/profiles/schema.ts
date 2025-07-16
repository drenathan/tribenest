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

// Profile Configuration Schemas
const emailConfigurationSchema = z.object({
  body: z.object({
    smtpHost: z.string().min(1, "SMTP host is required"),
    smtpPort: z.string().min(1, "SMTP port is required"),
    smtpUsername: z.string().min(1, "SMTP username is required"),
    smtpPassword: z.string().min(1, "SMTP password is required"),
    smtpFrom: z.string(),
  }),
});

const r2ConfigurationSchema = z.object({
  body: z.object({
    r2BucketName: z.string().min(1, "R2 bucket name is required"),
    r2AccessKeyId: z.string().min(1, "R2 access key ID is required"),
    r2SecretAccessKey: z.string().min(1, "R2 secret access key is required"),
    r2Endpoint: z.string().min(1, "R2 endpoint is required"),
    r2Region: z.string().min(1, "R2 region is required"),
    r2BucketUrl: z.string().url("R2 bucket URL must be valid"),
  }),
});

const paymentConfigurationSchema = z.object({
  body: z.object({
    paymentProviderName: z.enum(["stripe", "paypal"]),
    paymentProviderPublicKey: z.string().min(1, "Payment provider public key is required"),
    paymentProviderPrivateKey: z.string().min(1, "Payment provider private key is required"),
  }),
});

const updateProfileConfigurationSchema = z.object({
  body: z.object({
    email: emailConfigurationSchema.shape.body.optional(),
    r2: r2ConfigurationSchema.shape.body.optional(),
    payment: paymentConfigurationSchema.shape.body.optional(),
  }),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>["body"];
export type ValidateSubdomainInput = z.infer<typeof validateSubdomainSchema>["body"];
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>["body"];
export type GetMediaInput = z.infer<typeof getMediaSchema>["query"];
export type EmailConfigurationInput = z.infer<typeof emailConfigurationSchema>["body"];
export type R2ConfigurationInput = z.infer<typeof r2ConfigurationSchema>["body"];
export type PaymentConfigurationInput = z.infer<typeof paymentConfigurationSchema>["body"];
export type UpdateProfileConfigurationInput = z.infer<typeof updateProfileConfigurationSchema>["body"];

export {
  createProfileSchema,
  validateSubdomainSchema,
  uploadMediaSchema,
  getMediaSchema,
  emailConfigurationSchema,
  r2ConfigurationSchema,
  paymentConfigurationSchema,
  updateProfileConfigurationSchema,
};
