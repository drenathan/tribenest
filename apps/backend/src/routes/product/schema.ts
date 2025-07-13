import { z } from "zod";
import { paginationSchema } from "../schema";
import { ProductCategory, ProductDeliveryType } from "@src/db/types/product";

export const getProductsSchema = z.object({
  query: z.object({
    profileId: z.string(),
    category: z.nativeEnum(ProductCategory).optional(),
    ...paginationSchema.shape,
  }),
});

export const getProductSchema = z.object({
  query: z.object({
    profileId: z.string().uuid(),
  }),
});

export type GetProductsInput = z.infer<typeof getProductsSchema>["query"];
export type GetProductInput = z.infer<typeof getProductSchema>["query"];

export const createProductSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(100, "Title must be less than 100 characters"),
      description: z
        .string()
        .min(5, "Description must be at least 5 characters")
        .max(1000, "Description must be less than 1000 characters"),
      deliveryType: z.nativeEnum(ProductDeliveryType),
      price: z.number().min(0, "Price must be greater than 0"),
      category: z.nativeEnum(ProductCategory),
      publishedAt: z.string().optional(),
      coverImage: z.string().url(),
      coverImageSize: z.number(),
      profileId: z.string().uuid(),
      tracks: z
        .array(
          z.object({
            title: z.string().optional(),
            file: z.string().url(),
            fileSize: z.number(),
            description: z.string().optional(),
            isFeatured: z.boolean().default(false),
            hasExplicitContent: z.boolean().default(false),
          }),
        )
        .optional(),
    })
    .refine(
      (data) => {
        if (data.category === ProductCategory.Music) {
          return !!data.tracks?.length;
        }
        return true;
      },
      { message: "Music products must have tracks", path: ["tracks"] },
    ),
});

export const updateProductSchema = z.object({
  body: z.object({
    caption: z
      .string()
      .min(5, "Caption must be at least 5 characters")
      .max(1000, "Caption must be less than 1000 characters"),
    membershipTiers: z.array(z.string().uuid()).optional().default([]),
    profileId: z.string().min(1),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
