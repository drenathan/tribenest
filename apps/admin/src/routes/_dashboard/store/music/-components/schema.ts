import { ProductCategory, ProductDeliveryType } from "@/types/product";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const createProductSchema = z
  .object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .min(5, "Description must be at least 5 characters")
      .max(1000, "Description must be less than 1000 characters"),
    deliveryType: z.nativeEnum(ProductDeliveryType),
    price: z.coerce.number().min(0, "Price must be at least 0"),
    artist: z.string().optional(),
    category: z.nativeEnum(ProductCategory),
    credits: z.string().optional(),
    publishedAt: z.string().optional(),
    profileId: z.string().uuid().optional(),
    payWhatYouWant: z.boolean().default(false).optional(),
    upcCode: z.string().optional(),
    coverImage: z.object({
      file: z.union([
        z.instanceof(File, { message: "Cover image is required" }),
        z.string().url("Cover image is required"),
      ]),
      fileSize: z.number(),
      fileName: z.string(),
    }),
    tracks: z
      .array(
        z.object({
          file: z.union([z.instanceof(File, { message: "File is required" }), z.string().url("File is required")]),
          fileSize: z.number(),
          fileName: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          isFeatured: z.boolean().default(false).optional(),
          hasExplicitContent: z.boolean().default(false).optional(),
          id: z.string().uuid(),
          artist: z.string().optional(),
          credits: z.string().optional(),
          isrcCode: z.string().optional(),
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
  );

export type CreateProductInput = z.infer<typeof createProductSchema>;
export const createProductResolver = zodResolver(createProductSchema);
