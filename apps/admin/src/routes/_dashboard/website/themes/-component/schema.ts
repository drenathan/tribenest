import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createWebsiteThemeSchema = z.object({
  name: z.string().min(4, "Name is too short, should be at least 3 characters").max(50, "Name is too long"),
  description: z
    .string()
    .min(4, "Description is too short, should be at least 3 characters")
    .max(255, "Description is too long"),
  profileId: z.string().uuid("Invalid profile ID").optional(),
});

export type CreateWebsiteThemeInput = z.infer<typeof createWebsiteThemeSchema>;

export const createWebsiteThemeResolver = zodResolver(createWebsiteThemeSchema);
