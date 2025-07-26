import { UpdateProductInput } from "@src/routes/product/schema";
import { ProductService } from "..";
import { BadRequestError } from "@src/utils/app_error";
import { isUndefined, omitBy } from "lodash";

export async function updateProduct(this: ProductService, input: UpdateProductInput & { productId: string }) {
  const trx = await this.database.client.startTransaction().execute();
  const product = await this.database.models.Product.getOne({ productId: input.productId, profileId: input.profileId });

  if (!product) {
    throw new BadRequestError("Product not found");
  }

  const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
  const coverImage =
    product.media.find((m) => m.type === "image") || defaultVariant?.media.find((m) => m.type === "image");

  try {
    await this.database.models.Product.updateOne(
      { id: input.productId },
      omitBy(
        {
          title: input.title,
          description: input.description,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
          credits: input.credits,
          artist: input.artist,
          isFeatured: input.isFeatured,
        },
        isUndefined,
      ),
      trx,
    );

    if (input.coverImage && input.coverImage.file !== coverImage?.url) {
      await this.database.models.Media.updateOne(
        { id: coverImage?.id },
        { url: input.coverImage.file, filename: input.coverImage.fileName, size: input.coverImage.fileSize },
        trx,
      );
    }

    await this.database.models.ProductVariant.updateOne(
      {
        id: defaultVariant.id,
      },
      omitBy(
        {
          title: input.title,
          price: input.price,
          upcCode: input.upcCode,
          payWhatYouWant: input.payWhatYouWant,
        },
        isUndefined,
      ),
      trx,
    );

    if (input.tracks) {
      for (const track of input.tracks) {
        await this.database.models.ProductVariantTrack.updateOne(
          { id: track.id },
          omitBy(
            {
              title: track.title,
              description: track.description,
              isFeatured: track.isFeatured,
              hasExplicitContent: track.hasExplicitContent,
              credits: track.credits,
              isrcCode: track.isrcCode,
              artist: track.artist,
            },
            isUndefined,
          ),
          trx,
        );
      }
    }

    await trx.commit().execute();
  } catch (error) {
    await trx.rollback().execute();
    throw error;
  }
}
