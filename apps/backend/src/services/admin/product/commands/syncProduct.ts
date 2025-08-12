import { ProductService } from "..";
import { BadRequestError } from "@src/utils/app_error";
import { MediaType } from "@src/types";
import { ProductDeliveryType } from "@src/db/types/product";
import { ExternalProduct } from "@src/services/_apis/store/ExternalStore";
import { DB } from "@src/db/types";
import { ControlledTransaction, Transaction } from "kysely";

export async function syncProduct(
  this: ProductService,
  input: { product: ExternalProduct; storeId: string },
  transaction?: Transaction<DB>,
) {
  const trx = transaction ?? (await this.database.client.startTransaction().execute());
  const item = input.product;

  try {
    const category = await this.database.models.ProductCategory.findOne({
      title: "Merch",
    });

    const store = await this.database.models.ProductStore.findById(input.storeId);

    if (!store) {
      throw new BadRequestError("Store not found");
    }

    if (!category) {
      throw new BadRequestError("Category not found");
    }

    let product = await this.database.models.Product.findOne({
      externalId: item.id,
    });

    if (!product) {
      product = await this.database.models.Product.insertOne(
        {
          title: item.name,
          description: "",
          categoryId: category.id,
          profileId: store.profileId,
          isSingle: item.variants.length === 1,
          externalId: item.id,
          productStoreId: input.storeId,
        },
        trx,
      );
    } else {
      await this.database.models.Product.updateOne({ id: product.id }, { title: item.name }, trx);
    }

    await this.database.models.Media.deleteManyForEntity(product.id, "product", trx);

    const media = await this.database.models.Media.insertOne(
      {
        url: item.coverImage,
        size: 0,
        filename: item.coverImage.split("/").pop() ?? "",
        type: MediaType.Image,
        profileId: store.profileId,
        parent: "product",
        productStoreId: input.storeId,
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

    for (const variant of item.variants) {
      let productVariant = await this.database.models.ProductVariant.findOne({
        externalId: variant.id,
      });

      if (!productVariant) {
        productVariant = await this.database.models.ProductVariant.insertOne(
          {
            productId: product.id,
            title: variant.name,
            price: variant.price,
            deliveryType: ProductDeliveryType.Physical,
            externalId: variant.id,
            availabilityStatus: variant.availabilityStatus,
          },
          trx,
        );
      } else {
        await this.database.models.ProductVariant.updateOne(
          { id: productVariant.id },
          { title: variant.name, price: variant.price, availabilityStatus: variant.availabilityStatus },
          trx,
        );
      }

      await this.database.models.Media.deleteManyForEntity(productVariant.id, "product_variant", trx);

      // Create the available options

      for (const image of variant.images) {
        const media = await this.database.models.Media.insertOne({
          url: image,
          size: 0,
          filename: image.split("/").pop() ?? "",
          type: MediaType.Image,
          profileId: store.profileId,
          parent: "product_variant",
          productStoreId: input.storeId,
        });

        await this.database.models.MediaMapping.insertOne({
          mediaId: media.id,
          entityId: productVariant.id,
          entityType: "product_variant",
          order: 0,
        });
      }
    }

    if (!transaction) {
      await (trx as ControlledTransaction<DB>).commit().execute();
    }

    return product;
  } catch (error) {
    if (!transaction) {
      await (trx as ControlledTransaction<DB>).rollback().execute();
    }
    throw error;
  }
}
