import type { PostType } from "@tribe-nest/frontend-shared";

export type IPost = {
  id: string;
  caption: string;
  media: IMedia[];
  likes: number;
  comments: number;
  createdAt: string;
  membershipTiers: string[];
  type: PostType;
  profileId: string;
};

export type IMedia = {
  id: string;
  url: string;
  size: number;
  name: string;
  type: MediaType;
};

export type MediaType = "image" | "video" | "audio" | "document";
