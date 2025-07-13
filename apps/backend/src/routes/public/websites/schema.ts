import { z } from "zod";

const getWebsiteSchema = z.object({
  query: z.object({
    subdomain: z.string().min(1, "Subdomain is required"),
    pathname: z.string().min(1, "Pathname is required"),
  }),
});

export type GetWebsiteInput = z.infer<typeof getWebsiteSchema>["query"];

export { getWebsiteSchema };
