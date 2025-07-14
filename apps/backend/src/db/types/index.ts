import * as GeneratedTypes from "./generated";
import { MediaType, MediaParent } from "./media";
import { ColumnType } from "kysely";
import { PostType } from "./post";

type Media = Omit<GeneratedTypes.Media, "type" | "parent"> & {
  type: MediaType;
  parent: MediaParent;
};

type MediaMapping = Omit<GeneratedTypes.MediaMappings, "entityType"> & {
  entityType: MediaParent;
};

type Post = Omit<GeneratedTypes.Posts, "membershipTiers"> & {
  membershipTiers: ColumnType<string[], GeneratedTypes.JsonArray>;
  type: ColumnType<PostType>;
};

export interface DB extends GeneratedTypes.DB {
  media: Media;
  posts: Post;
  mediaMappings: MediaMapping;
}
