import * as GeneratedTypes from "./generated";
import { MediaType, MediaParent } from "./media";
import { ColumnType } from "kysely";
import { PostType } from "./post";
import { MembershipStatus } from "./membership";
import { OrderStatus } from "./product";
import { ProfileAddress, ProfileOnboardingStepId, PWAConfig, StorageType } from "./profile";
import { EmailRecipientStatus, EmailStatus } from "./email";
import { ExternalStoreProvider } from "@src/services/_apis/store/ExternalStore";

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

type Email = Omit<GeneratedTypes.Emails, "status"> & {
  status: EmailStatus;
};

type EmailRecipient = Omit<GeneratedTypes.EmailRecipients, "status"> & {
  status: EmailRecipientStatus;
};

type ProfileConfiguration = Omit<GeneratedTypes.ProfileConfigurations, "pwaConfig" | "address" | "storageType"> & {
  pwaConfig: ColumnType<PWAConfig, GeneratedTypes.Json, string | null>;
  address: ColumnType<ProfileAddress, GeneratedTypes.Json, string | null>;
  storageType: StorageType;
};

type ProductStore = Omit<GeneratedTypes.ProductStores, "provider"> & {
  provider: ExternalStoreProvider;
};

type Event = Omit<GeneratedTypes.Events, "address"> & {
  address: ColumnType<
    {
      name: string;
      street: string;
      city: string;
      country: string;
      zipCode?: string;
    },
    GeneratedTypes.Json,
    string
  >;
};

export interface DB extends GeneratedTypes.DB {
  media: Media;
  posts: Post;
  mediaMappings: MediaMapping;
  memberships: Membership;
  orders: Order;
  productStores: ProductStore;
  profileOnboardingSteps: ProfileOnboardingStep;
  emails: Email;
  emailRecipients: EmailRecipient;
  profileConfigurations: ProfileConfiguration;
  events: Event;
}
