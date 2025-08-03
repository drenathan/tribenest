import { CreateProductInput } from "@src/routes/product/schema";
import { ProductService } from "..";
import { BadRequestError } from "@src/utils/app_error";
import { MediaType } from "@src/types";
import { ProductDeliveryType } from "@src/db/types/product";
import { ProfileOnboardingStepId } from "@src/db/types/profile";

export async function createProduct(this: ProductService, input: CreateProductInput) {
  const trx = await this.database.client.startTransaction().execute();

  try {
    const category = await this.database.models.ProductCategory.findOne({
      title: input.category,
    });

    if (!category) {
      throw new BadRequestError("Category not found");
    }

    const product = await this.database.models.Product.insertOne(
      {
        title: input.title,
        description: input.description,
        categoryId: category.id,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
        isSingle: input.tracks?.length === 1,
        profileId: input.profileId,
        credits: input.credits,
        artist: input.artist,
        isFeatured: input.isFeatured || false,
      },
      trx,
    );

    const media = await this.database.models.Media.insertOne(
      {
        url: input.coverImage.file,
        size: input.coverImage.fileSize,
        filename: input.coverImage.fileName,
        type: MediaType.Image,
        profileId: input.profileId,
        parent: "product",
      },
      trx,
    );
    await this.database.models.MediaMapping.insertOne(
      {
        mediaId: media.id,
        entityId: product.id,
        entityType: "product",
        order: 0,
      },
      trx,
    );

    const variant = await this.database.models.ProductVariant.insertOne(
      {
        productId: product.id,
        title: input.title,
        price: input.price,
        deliveryType: ProductDeliveryType.Digital,
        isDefault: true,
        upcCode: input.upcCode,
        payWhatYouWant: input.payWhatYouWant,
      },
      trx,
    );

    if (input.tracks) {
      for (const track of input.tracks) {
        const newTrack = await this.database.models.ProductVariantTrack.insertOne(
          {
            productVariantId: variant.id,
            title: track.title ?? input.title,
            description: track.description,
            isFeatured: track.isFeatured,
            hasExplicitContent: track.hasExplicitContent,
            credits: track.credits,
            isrcCode: track.isrcCode,
            artist: track.artist,
          },
          trx,
        );

        const media = await this.database.models.Media.insertOne(
          {
            url: track.file,
            size: track.fileSize,
            type: MediaType.Audio,
            profileId: input.profileId,
            filename: track.fileName,
            parent: "product_variant_track",
          },
          trx,
        );
        await this.database.models.MediaMapping.insertOne(
          {
            mediaId: media.id,
            entityId: newTrack.id,
            entityType: "product_variant_track",
            order: 0,
          },
          trx,
        );
      }
    }

    await this.database.models.ProfileOnboardingStep.updateOne(
      { profileId: input.profileId, id: ProfileOnboardingStepId.UploadFirstMusic, completedAt: null },
      { completedAt: new Date() },
      trx,
    );

    await trx.commit().execute();
  } catch (error) {
    await trx.rollback().execute();
    throw error;
  }
}
