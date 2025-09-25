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
    parent: z.enum(["posts", "website", "stream_background", "stream_overlay", "stream_logo"]),
    name: z.string().optional(),
    size: z.number(),
  }),
});

const getMediaSchema = z.object({
  query: z.object({
    parent: z.enum(["posts", "website", "stream_background", "stream_overlay", "stream_logo"]),
    type: z.enum(["image", "video", "audio", "document"]),
  }),
});

// Profile Configuration Schemas
const emailConfigurationSchema = z.object({
  body: z.object({
    smtpHost: z.string().min(1, "SMTP host is required").optional(),
    smtpPort: z.string().min(1, "SMTP port is required").optional(),
    smtpUsername: z.string().min(1, "SMTP username is required").optional(),
    smtpPassword: z.string().min(1, "SMTP password is required").optional(),
    smtpFrom: z.string().optional(),
  }),
});

const r2ConfigurationSchema = z.object({
  body: z.object({
    r2BucketName: z.string().min(1, "R2 bucket name is required").optional(),
    r2AccessKeyId: z.string().min(1, "R2 access key ID is required").optional(),
    r2SecretAccessKey: z.string().min(1, "R2 secret access key is required").optional(),
    r2Endpoint: z.string().min(1, "R2 endpoint is required").optional(),
    r2Region: z.string().min(1, "R2 region is required").optional(),
    r2BucketUrl: z.string().url("R2 bucket URL must be valid").optional(),
  }),
});

const paymentConfigurationSchema = z.object({
  body: z.object({
    paymentProviderName: z.enum(["stripe", "paypal"]),
    paymentProviderPublicKey: z.string().min(1, "Payment provider public key is required"),
    paymentProviderPrivateKey: z.string().min(1, "Payment provider private key is required"),
    paymentProviderWebhookSecret: z.string().min(1, "Payment provider webhook secret is required"),
  }),
});

const pwaConfigurationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    shortName: z.string().min(1, "Short name is required"),
    description: z.string().min(1, "Description is required"),
    icon192: z.string().min(1, "Icon 192 is required"),
    icon512: z.string().min(1, "Icon 512 is required"),
    icon96: z.string().min(1, "Icon 96 is required"),
    screenshotWide1280X720: z.string().min(1, "Screenshot wide 1280x720 is required"),
    screenshotNarrow750X1334: z.string().min(1, "Screenshot narrow 750x1334 is required"),
  }),
});

const addressConfigurationSchema = z.object({
  body: z
    .object({
      street: z.string().min(1, "Street is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      zipCode: z.string().min(1, "Zip code is required").optional(),
      country: z.string().min(1, "Country is required"),
    })
    .refine(
      (data) => {
        if (data.country?.toLocaleLowerCase() === "us") {
          return (data.zipCode?.length ?? 0) > 4;
        }

        return true;
      },
      {
        message: "Zip code must be 5 digits",
      },
    ),
});

const updateProfileConfigurationSchema = z.object({
  body: z.object({
    email: emailConfigurationSchema.shape.body.optional(),
    r2: r2ConfigurationSchema.shape.body.optional(),
    payment: paymentConfigurationSchema.shape.body.optional(),
    pwa: pwaConfigurationSchema.shape.body.optional(),
    address: addressConfigurationSchema.shape.body.optional(),
  }),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>["body"];
export type ValidateSubdomainInput = z.infer<typeof validateSubdomainSchema>["body"];
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>["body"];
export type GetMediaInput = z.infer<typeof getMediaSchema>["query"];
export type EmailConfigurationInput = z.infer<typeof emailConfigurationSchema>["body"];
export type R2ConfigurationInput = z.infer<typeof r2ConfigurationSchema>["body"];
export type PaymentConfigurationInput = z.infer<typeof paymentConfigurationSchema>["body"];
export type PWAConfigurationInput = z.infer<typeof pwaConfigurationSchema>["body"];
export type AddressConfigurationInput = z.infer<typeof addressConfigurationSchema>["body"];
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
