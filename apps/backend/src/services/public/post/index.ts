import { IMembership } from "@src/db/models/membership/membership.model";
import { DB } from "@src/db/types";
import { GetPostsInput } from "@src/routes/public/posts/schema";
import { BaseService } from "@src/services/baseService";
import { PaginatedData } from "@src/types";
import { Selectable } from "kysely";

export class PostService extends BaseService {
  public async getPosts(input: GetPostsInput, membership?: Selectable<DB["memberships"]>): Promise<PaginatedData<{}>> {
    if (membership && membership.profileId !== input.profileId) {
      return {
        hasNextPage: false,
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        nextPage: null,
      };
    }

    const { data, total } = await this.database.models.Post.getManyForPublic(input, membership);
    const hasNextPage = data.length === input.limit;

    return {
      hasNextPage,
      data,
      total: Number(total),
      page: input.page,
      pageSize: input.limit,
      nextPage: hasNextPage ? input.page + 1 : null,
    };
  }

  public async getSavedPosts(input: { accountId: string; membership: Selectable<DB["memberships"]> }) {
    const savedPosts = await this.models.Post.getSavedPosts(input);
    return savedPosts;
  }
}
