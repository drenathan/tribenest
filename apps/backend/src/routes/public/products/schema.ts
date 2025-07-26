import { ProductCategory } from "@src/db/types/product";
import { paginationSchema } from "@src/routes/schema";
import { z } from "zod";

export const getProductsSchema = z.object({
  query: z.object({
    profileId: z.string(),
    category: z.nativeEnum(ProductCategory).optional(),
    ...paginationSchema.shape,
  }),
});

export const getFeaturedProductsSchema = z.object({
  query: z.object({
    profileId: z.string().uuid("Invalid profile ID"),
    category: z.nativeEnum(ProductCategory).default(ProductCategory.Music),
  }),
});

export type GetProductsInput = z.infer<typeof getProductsSchema>["query"];
export type GetFeaturedProductsInput = z.infer<typeof getFeaturedProductsSchema>["query"];
