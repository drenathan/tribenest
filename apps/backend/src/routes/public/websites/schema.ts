import { z } from "zod";

const getWebsiteSchema = z.object({
  query: z.object({
    subdomain: z.string().min(1, "Subdomain is required"),
    pathname: z.string().min(1, "Pathname is required"),
  }),
});

export type GetWebsiteInput = z.infer<typeof getWebsiteSchema>["query"];

const contactSchema = z.object({
  body: z.object({
    profileId: z.string().min(1, "Profile ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    message: z.string().min(10, "Message must be at least 10 characters"),
  }),
});

export type ContactInput = z.infer<typeof contactSchema>["body"];

export { getWebsiteSchema, contactSchema };
