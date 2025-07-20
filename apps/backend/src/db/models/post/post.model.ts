import { Expression, Kysely, Selectable, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { GetPostsInput } from "@src/routes/posts/schema";
import { GetPostsInput as GetPublicPostsInput } from "@src/routes/public/posts/schema";
import { filter } from "lodash";
import { PostType } from "@src/db/types/post";
export type IPost = DB["posts"];

type PostFilter = {
  membershipTierId?: string;
  query?: string;
  type?: PostType | "all";
  archived?: string;
  postIds?: string[];
};

export class PostModel extends BaseModel<"posts", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "posts", "id");
  }

  public async getMany(input: GetPostsInput & { postId?: string }) {
    const skip = (input.page - 1) * input.limit;
    const limit = input.limit || 10;
    const { membershipTierId, query, type, archived, postIds } = (input.filter ?? {}) as PostFilter;
    const isArchived = archived === "true";

    const filterQuery = this.client
      .selectFrom("posts")
      .where("profileId", "=", input.profileId)
      .where(({ eb }) => {
        const conditions: Expression<SqlBool>[] = [];
        if (input.postId) {
          conditions.push(eb("posts.id", "=", input.postId));
        }
        conditions.push(eb("posts.profileId", "=", input.profileId));

        if (query) {
          conditions.push(eb("posts.caption", "ilike", `%${query}%`));
        }
        if (type && type !== "all") {
          conditions.push(eb("posts.type", "=", type));
        }
        if (membershipTierId) {
          conditions.push(eb("posts.membershipTiers", "@>", JSON.stringify([membershipTierId]) as unknown as string[]));
        }

        if (isArchived) {
          conditions.push(eb("posts.archivedAt", "is not", null));
        } else {
          conditions.push(eb("posts.archivedAt", "is", null));
        }

        if (postIds && postIds.length > 0) {
          conditions.push(eb("posts.id", "in", postIds));
        }

        return eb.and(conditions);
      });

    const total = await filterQuery.select((eb) => [eb.fn.countAll().as("total")]).executeTakeFirstOrThrow();

    const data = await filterQuery
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
    const filter = (input.filter ?? {}) as PostFilter;

    const filterQuery = this.client.selectFrom("posts").where(({ eb }) => {
      const conditions: Expression<SqlBool>[] = [];
      if (filter.membershipTierId) {
        conditions.push(
          eb("posts.membershipTiers", "@>", JSON.stringify([filter.membershipTierId]) as unknown as string[]),
        );
      }
      if (filter.type && filter.type !== "all") {
        conditions.push(eb("posts.type", "=", filter.type));
      }
      if (filter.query) {
        conditions.push(eb("posts.caption", "ilike", `%${filter.query}%`));
      }
      conditions.push(eb("posts.profileId", "=", input.profileId));
      conditions.push(eb("posts.archivedAt", "is", null));
      return eb.and(conditions);
    });

    const total = await filterQuery.select((eb) => [eb.fn.countAll().as("total")]).executeTakeFirstOrThrow();

    const data = await filterQuery
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

  public async getSavedPosts({
    accountId,
    membership,
  }: {
    accountId: string;
    membership: Selectable<DB["memberships"]>;
  }) {
    const savedPosts = await this.client
      .selectFrom("saves")
      .where("accountId", "=", accountId)
      .where("entityType", "=", "post")
      .select("accountId")
      .execute();

    if (!savedPosts.length) {
      return {
        data: [],
        total: 0,
      };
    }

    return this.getManyForPublic({
      profileId: membership.profileId,
      limit: 50,
      page: 1,
      filter: {
        postIds: savedPosts.map((save) => save.accountId),
      },
    });
  }
}
