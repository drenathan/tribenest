import { Expression, Kysely, Selectable, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { GetProductInput, type GetProductsInput } from "@src/routes/product/schema";
import { type GetProductsInput as GetPublicProductsInput } from "@src/routes/public/products/schema";
import { IProductVariant } from "./productVariant.model";
import { IProductVariantTrack } from "./productVariantTrack.model";
import { IMedia } from "../media/media.model";

export type IProduct = DB["products"];
export type GetManyProductResult = (Selectable<IProduct> & {
  variants: (Selectable<IProductVariant> & {
    tracks: (Selectable<IProductVariantTrack> & { media: Selectable<IMedia>[] })[];
  })[];
})[];

export class ProductModel extends BaseModel<"products", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "products", "id");
  }

  public async getOne(input: GetProductInput & { productId: string }) {
    const {
      data: [product],
    } = await this.getMany({ ...input, page: 1, limit: 1 });
    return product;
  }

  public async getMany(input: GetProductsInput & { productId?: string }) {
    const limit = input.limit ?? 10;
    const page = input.page ?? 1;
    const total = await this.client
      .selectFrom("products as p")
      .innerJoin("productCategories as pc", "pc.id", "p.categoryId")
      .where((eb) => {
        const conditions: Expression<SqlBool>[] = [];
        if (input.productId) {
          conditions.push(eb("p.id", "=", input.productId));
        }
        conditions.push(eb("p.profileId", "=", input.profileId));
        if (input.category) {
          conditions.push(eb("pc.title", "=", input.category));
        }
        return eb.and(conditions);
      })
      .select((eb) => [eb.fn.countAll().as("total")])
      .executeTakeFirstOrThrow();

    if (total.total === 0) {
      return {
        data: [],
        total: 0,
      };
    }
    const products = await this.client
      .selectFrom("products as p")
      .innerJoin("productCategories as pc", "pc.id", "p.categoryId")
      .where((eb) => {
        const conditions: Expression<SqlBool>[] = [];
        if (input.productId) {
          conditions.push(eb("p.id", "=", input.productId));
        }
        if (input.category) {
          conditions.push(eb("pc.title", "=", input.category));
        }
        conditions.push(eb("p.profileId", "=", input.profileId));

        return eb.and(conditions);
      })
      .select((eb) => [
        eb.ref("p.id").as("id"),
        eb.ref("p.title").as("title"),
        eb.ref("p.description").as("description"),
        eb.ref("p.createdAt").as("createdAt"),
        eb.ref("p.publishedAt").as("publishedAt"),
        eb.ref("pc.title").as("category"),
        eb.ref("p.isSingle").as("isSingle"),
      ])
      .select((eb) => [
        this.jsonArrayFrom(
          eb
            .selectFrom("mediaMappings as mp")
            .innerJoin("media as m", "m.id", "mp.mediaId")
            .select(["m.url", "m.type", "m.size", "m.id"])
            .whereRef("mp.entityId", "=", "p.id")
            .orderBy("mp.order", "asc"),
        ).as("media"),

        this.jsonArrayFrom(
          eb
            .selectFrom("productVariants as pv")
            .selectAll()
            .select((eb) => [
              this.jsonArrayFrom(
                eb
                  .selectFrom("mediaMappings as mp")
                  .innerJoin("media as m", "m.id", "mp.mediaId")
                  .select(["m.url", "m.type", "m.size", "m.id"])
                  .whereRef("mp.entityId", "=", "pv.id")
                  .orderBy("mp.order", "asc"),
              ).as("media"),
              this.jsonArrayFrom(
                eb
                  .selectFrom("productVariantTracks as pvt")
                  .selectAll()
                  .select((eb) => [
                    this.jsonArrayFrom(
                      eb
                        .selectFrom("mediaMappings as mp")
                        .innerJoin("media as m", "m.id", "mp.mediaId")
                        .select(["m.url", "m.type", "m.size", "m.id"])
                        .whereRef("mp.entityId", "=", "pvt.id")
                        .orderBy("mp.order", "asc"),
                    ).as("media"),
                  ])
                  .whereRef("pvt.productVariantId", "=", "pv.id")
                  .orderBy("pvt.createdAt", "desc"),
              ).as("tracks"),
            ])
            .whereRef("pv.productId", "=", "p.id")
            .orderBy("pv.createdAt", "desc"),
        ).as("variants"),
      ])
      .orderBy("p.createdAt", "desc")
      .offset((page - 1) * limit)
      .limit(limit)
      .execute();

    return {
      data: products as unknown as GetManyProductResult,
      total: total.total,
    };
  }

  public async getManyForPublic(input: GetPublicProductsInput, membership?: Selectable<DB["memberships"]>) {
    return this.getMany(input);
  }
}
