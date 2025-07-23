import { PostType } from "@src/db/types/post";
import { BaseService } from "../../baseService";
import { CreatePostInput, GetPostsInput, UpdatePostInput } from "@src/routes/posts/schema";
import { MediaType } from "@src/db/types/media";
import { PaginatedData } from "@src/types";
import { JsonArray } from "@src/db/types/generated";

const postTypeToMediaType: Record<PostType, MediaType> = {
  image: "image",
  video: "video",
  audio: "audio",
  poll: "image",
};
// type GetManyPostResponse = IPost & {
//   media: (IMedia & IPostMedia)[];
// };

export class PostService extends BaseService {
  public async getPosts(input: GetPostsInput): Promise<PaginatedData<{}>> {
    const { data, total } = await this.database.models.Post.getMany(input);
    const hasNextPage = data.length === input.limit;

    return {
      hasNextPage,
      data,
      total: Number(total),
      page: input.page,
      nextPage: hasNextPage ? input.page + 1 : null,
      pageSize: input.limit,
    };
  }

  public async getPost(input: { postId: string; profileId: string }) {
    const {
      data: [post],
    } = await this.database.models.Post.getMany({
      postId: input.postId,
      profileId: input.profileId,
      page: 1,
      limit: 1,
      filter: {},
    });
    return post;
  }

  public async createPost(input: CreatePostInput, userId: string) {
    const trx = await this.database.client.startTransaction().execute();
    try {
      const post = await this.database.models.Post.insertOne(
        {
          caption: input.caption,
          createdBy: userId,
          type: input.type,
          profileId: input.profileId,
          membershipTiers: JSON.stringify(input.membershipTiers) as unknown as JsonArray,
        },
        trx,
      );

      const media = await this.database.models.Media.insertOne(
        {
          type: postTypeToMediaType[input.type],
          parent: "post",
          size: input.mediaSize,
          url: input.mediaLink,
          profileId: input.profileId,
        },
        trx,
      );

      await this.database.models.MediaMapping.insertOne(
        { entityId: post.id, mediaId: media.id, order: 1, entityType: "post" },
        trx,
      );

      await trx.commit().execute();
      return true;
    } catch (error) {
      await trx.rollback().execute();
      throw error;
    }
  }

  public async updatePost(input: UpdatePostInput & { postId: string }) {
    await this.database.models.Post.updateOne(
      { id: input.postId, profileId: input.profileId },
      {
        caption: input.caption,
        membershipTiers: JSON.stringify(input.membershipTiers) as unknown as string[],
      },
    );

    return true;
  }

  public async archivePost(postId: string) {
    await this.database.models.Post.updateOne({ id: postId }, { archivedAt: new Date() });
    return true;
  }

  public async unarchivePost(postId: string) {
    await this.database.models.Post.updateOne({ id: postId }, { archivedAt: null });
    return true;
  }
}
