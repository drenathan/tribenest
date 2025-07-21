import * as GeneratedTypes from "./generated";
import { MediaType, MediaParent } from "./media";
import { ColumnType } from "kysely";
import { PostType } from "./post";
import { MembershipStatus } from "./membership";
import { OrderStatus } from "./product";
import { ProfileOnboardingStepId } from "./profile";

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

type Membership = Omit<GeneratedTypes.Memberships, "status"> & {
  status: MembershipStatus;
};

type Order = Omit<GeneratedTypes.Orders, "status"> & {
  status: OrderStatus;
};

type ProfileOnboardingStep = Omit<GeneratedTypes.ProfileOnboardingSteps, "id"> & {
  id: ProfileOnboardingStepId;
};

export interface DB extends GeneratedTypes.DB {
  media: Media;
  posts: Post;
  mediaMappings: MediaMapping;
  memberships: Membership;
  orders: Order;
  profileOnboardingSteps: ProfileOnboardingStep;
}
