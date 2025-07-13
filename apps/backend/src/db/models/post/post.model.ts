import { Expression, Kysely, Selectable, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { GetPostsInput } from "@src/routes/posts/schema";
import { GetPostsInput as GetPublicPostsInput } from "@src/routes/public/posts/schema";
export type IPost = DB["posts"];

export class PostModel extends BaseModel<"posts", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "posts", "id");
  }

  public async getMany(input: GetPostsInput & { postId?: string }) {
    const skip = (input.page - 1) * input.limit;
    const limit = input.limit || 10;

    const total = await this.client
      .selectFrom("posts")
      .where("profileId", "=", input.profileId)
      .select((eb) => [eb.fn.countAll().as("total")])
      .executeTakeFirstOrThrow();

    const data = await this.client
      .selectFrom("posts")
      .where(({ eb }) => {
        const conditions: Expression<SqlBool>[] = [];
        if (input.postId) {
          conditions.push(eb("posts.id", "=", input.postId));
        }
        conditions.push(eb("posts.profileId", "=", input.profileId));
        conditions.push(eb("posts.archivedAt", "is", null));
        return eb.and(conditions);
      })
      .selectAll()
      .select((eb) => [
        this.jsonArrayFrom(
          eb
            .selectFrom("mediaMappings as mp")
            .innerJoin("media as m", "m.id", "mp.mediaId")
            .select(["m.url", "m.type", "m.size", "m.id"])
            .whereRef("mp.entityId", "=", "posts.id")
            .orderBy("mp.order", "asc"),
        ).as("media"),
      ])
      .orderBy("posts.createdAt", "desc")
      .limit(limit)
      .offset(skip)
      .execute();

    return {
      data,
      total: total.total,
    };
  }

  public async getManyForPublic(input: GetPublicPostsInput, membership?: Selectable<DB["memberships"]>) {
    const skip = (input.page - 1) * input.limit;
    const limit = input.limit || 10;
    const total = await this.client
      .selectFrom("posts")
      .where("profileId", "=", input.profileId)
      .select((eb) => [eb.fn.countAll().as("total")])
      .executeTakeFirstOrThrow();

    const data = await this.client
      .selectFrom("posts")
      .where("profileId", "=", input.profileId)
      .select((eb) => {
        const hasAccess = eb.or([
          eb("posts.membershipTiers", "=", "[]" as unknown as string[]),
          ...(membership
            ? [eb("posts.membershipTiers", "@>", JSON.stringify([membership.membershipTierId]) as unknown as string[])]
            : []),
        ]);

        return [
          eb.ref("posts.id").as("id"),
          eb.ref("posts.caption").as("caption"),
          eb.ref("posts.createdAt").as("createdAt"),
          eb.ref("posts.type").as("type"),
          eb.ref("posts.profileId").as("profileId"),
          hasAccess.as("hasAccess"),

          eb
            .selectFrom("mediaMappings as mp")
            .innerJoin("media as m", "m.id", "mp.mediaId")
            .select(["m.url", "m.type", "m.size", "m.id"])
            .whereRef("mp.entityId", "=", "posts.id")
            .where(hasAccess)
            .orderBy("mp.order", "asc")
            .$call((qb) => this.jsonArrayFrom(qb))
            .as("media"),
        ];
      })
      .orderBy("posts.createdAt", "desc")
      .limit(limit)
      .offset(skip)
      .execute();

    return {
      data,
      total: total.total,
    };
  }
}
