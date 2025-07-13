import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const createProfileSchema = z.object({
  subdomain: z
    .string({
      required_error: "Subdomain is required",
      invalid_type_error: "Subdomain is invalid",
    })
    .min(4, "Subdomain is too short, should be at least 4 characters")
    .max(50, "Subdomain is too long")
    .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, "Subdomain is invalid"), // subdomain regex
  name: z.string().min(4, "Name is too short, should be at least 4 characters").max(50, "Name is too long"),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export const createProfileResolver = zodResolver(createProfileSchema);
