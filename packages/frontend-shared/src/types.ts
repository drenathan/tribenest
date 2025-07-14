import type { AxiosInstance } from "axios";
import type { UserComponent } from "@craftjs/core";
import type { CreateAccountInput, LoginInput, PublicCreateAccountInput } from "./schema/auth";

export type ApiError = {
  response: {
    data: {
      message: string;
    };
  };
};

export type MembershipTier = {
  id: string;
  name: string;
  description: string;
  priceMonthly?: number;
  priceYearly?: number;
  payWhatYouWant: boolean;
  payWhatYouWantMinimum?: number;
  payWhatYouWantMaximum?: number;
  benefits: MembershipBenefit[];
};

export type MembershipBenefit = {
  id: string;
  title: string;
};

export type Media = {
  id: string;
  url: string;
  size: number;
  name: string;
  parent: "website" | "project";
  type: "image" | "video";
};

export type PaginatedData<T> = {
  data: T[];
  total: number;
  hasNextPage: boolean;
  page: number;
  nextPage: number | null;
  pageSize: number;
};

export type ThemePage = {
  pathname: string;
  title: string;
  description?: string;
  Component: React.ComponentType<{ profile: Profile }>;
};

export type ThemeConfig = {
  name: string;
  slug: string;
  description: string;
  author: string;
  version: string;
  thumbnail: string;
  preview: string;
  themeSettings: EditorTheme;
  pages: ThemePage[];
  editorResolver: Record<string, UserComponent>;
};

export interface Profile {
  id: string;
  name: string;
  paymentProvider: string;
  paymentProviderPublicKey: string;
}
export type EditorContextType = {
  profile?: Profile;
  isAdminView: boolean;
  httpClient?: AxiosInstance;
  themeSettings: EditorTheme;
  navigate: (href: string) => void;
  setThemeSettings: React.Dispatch<React.SetStateAction<EditorTheme>>;
  pages: ThemePage[];
  themeName?: string;
  currentProductId?: string;
  setCurrentProductId?: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export type EditorTheme = {
  colors: {
    primary: string;
    background: string;
    text: string;
    textPrimary: string;
  };
  cornerRadius: string;
  fontFamily: string;
  logo: string;
  headerLinks: { href: string; label: string }[];
  socialLinks: { href: string; icon: string }[];
  membershipSection?: {
    title: string;
  };
};

export type MediaType = "image" | "video" | "audio" | "document";

export type IMedia = {
  id: string;
  url: string;
  size: number;
  name: string;
  type: MediaType;
};

export enum ProductDeliveryType {
  Digital = "digital",
  Physical = "physical",
}

export enum ProductCategory {
  Music = "Music",
  Merch = "Merch",
}

export type PostType = "image" | "video" | "audio" | "poll";

export type IPublicPost = {
  id: string;
  caption: string;
  media?: IMedia[];
  likes: number;
  comments: number;
  createdAt: string;
  hasAccess: boolean;
  type: PostType;
  profileId: string;
};

export type IPublicProduct = {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  media: IMedia[];
  variants: IPublicProductVariant[];
};

export type IPublicProductVariant = {
  id: string;
  deliveryType: ProductDeliveryType;
  title: string;
  description: string;
  price: number;
  media: IMedia[];
  tracks: IPublicProductTrack[];
  isDefault: boolean;
  payWhatYouWant?: boolean;
  payWhatYouWantMaximum?: number;
};

export type IPublicProductTrack = {
  id: string;
  title: string;
  description: string;
  media: IMedia[];
  isFeatured: boolean;
  hasExplicitContent: boolean;
  artist: string;
};

export interface Membership {
  id: string;
  membershipTierId: string;
}
export interface PublicAuthUser {
  email: string;
  firstName: string;
  lastName: string;
  kind: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  membership?: Membership;
}
export type UpdateLocalUserPayload = Pick<PublicAuthUser, "firstName">;

export interface Profile {
  id: string;
  name: string;
  avatar?: string;
}

export type ProjectUser = {
  id: string;
  email: string;
  status: string;
  isOwner: boolean;
  firstName: string;
};

export interface PublicAuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: PublicAuthUser | null;
  isLoading: boolean;
  errorMessage: string | null;
  initialize: () => Promise<boolean>;
}
export interface PublicAuthContextType extends PublicAuthState {
  login: (data: LoginInput) => Promise<void>;
  register: (data: PublicCreateAccountInput) => Promise<void>;

  logout: (persist?: boolean) => Promise<void>;
  updateLocalUser: (data: UpdateLocalUserPayload) => void;
  clearErrorMessage: () => void;
  refetchUser: () => Promise<void>;
}

export type ActionMap<M extends { [index: string]: unknown }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};
