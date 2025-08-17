import type { AxiosInstance } from "axios";
import type { UserComponent } from "@craftjs/core";
import type { LoginInput, PublicCreateAccountInput } from "./schema/auth";

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
  deprecated?: boolean;
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

export type PWAConfig = {
  name: string;
  shortName: string;
  description: string;
  icon192: string;
  icon512: string;
  icon96: string;
  screenshotWide1280X720: string;
  screenshotNarrow750X1334: string;
};

export type ProfileAddress = {
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
};

export interface Profile {
  id: string;
  name: string;
  paymentProvider: string;
  paymentProviderPublicKey: string;
  pwaConfig: PWAConfig;
  address: ProfileAddress;
}

export type EditorContextType = {
  profile?: Profile;
  isAdminView: boolean;
  httpClient?: AxiosInstance;
  themeSettings: EditorTheme;
  navigate: (href: string, options?: { replace?: boolean; buttonId?: string }) => void;
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
export type IPublicComment = {
  id: string;
  content: string;
  createdAt: string;
  fullName: string;
  accountId: string;
};

export type IPublicProduct = {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  media: IMedia[];
  variants: IPublicProductVariant[];
  artist: string;
  credits: string;
  publishedAt: string;
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
  upcCode: string;
  color: string;
  size: string;
  availabilityStatus: "active" | "temporarily_out_of_stock";
};

export type IPublicProductTrack = {
  id: string;
  title: string;
  description: string;
  media: IMedia[];
  isFeatured: boolean;
  hasExplicitContent: boolean;
  artist: string;
  credits: string;
  isrcCode: string;
};

export interface Membership {
  id: string;
  membershipTierId: string;
  profilePaymentSubscriptionId: string;
  endDate: string;
  status: string;
  membershipTier: MembershipTier;
  startDate: string;
  subscriptionAmount: number;
  billingCycle: string;
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

export enum PaymentProviderName {
  Stripe = "stripe",
}
export enum OrderStatus {
  InitiatedPayment = "initiated_payment",
  PaymentFailed = "payment_failed",
  Failed = "failed",
  Paid = "paid",
  Processing = "processing",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

export type IPublicOrder = {
  id: string;
  deliveryGroups: {
    id: string;
    deliveryType: ProductDeliveryType;
    recipientName: string;
    recipientEmail: string;
    recipientMessage: string;
    items: IPublicOrderItem[];
    status: OrderStatus;
    subTotal: number;
    shippingCost: number;
  }[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
};

export type IPublicOrderItem = {
  productId: string;
  productVariantId: string;
  title: string;
  price: number;
  coverImage?: string;
  isGift: boolean;
  recipientName?: string;
  recipientEmail?: string;
  canIncreaseQuantity: boolean;
  quantity: number;
  recipientMessage?: string;
  payWhatYouWant: boolean;
  color: string;
  size: string;
};

export type SmartLinkTemplate = {
  title: string;
  slug: string;
  description?: string;
  version: string;
  thumbnail: string;
  preview?: string;
  themeSettings: EditorTheme;
  editorResolver: Record<string, UserComponent>;
  Component: React.ComponentType<{ profile: Profile }>;
};

export type SmartLink = {
  id: string;
  path: string;
  title: string;
  description?: string;
  content: string;
  themeSettings: EditorTheme;
  template?: string;
  thumbnail?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  profile: Profile;
};

export type IEmailList = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  subscriberCount: number;
};

export type IEmailTemplate = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type EmailStatus = "created" | "scheduled" | "processing" | "processed";

export type IEmail = {
  id: string;
  profileId: string;
  emailTemplateId: string;
  recipientEmail?: string;
  emailListId?: string;
  emailListTitle?: string;
  subject: string;
  status: EmailStatus;
  sendDate?: string;
  createdAt: string;
  updatedAt: string;
};

export interface IEvent {
  id: string;
  profileId: string;
  dateTime: string;
  address: {
    name: string;
    street: string;
    city: string;
    country: string;
    zipCode?: string;
  };
  title: string;
  description?: string;
  actionText: string;
  actionLink: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  tickets: ITicket[];
  media: IMedia[];
}

export type ITicket = {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  order: number;
  sold: number;
};

export type ITicketOrder = {
  id: string;
  items: ITicketOrderItem[];
  firstName: string;
  lastName: string;
  email: string;
  totalAmount: number;
  status: OrderStatus;
};

export type ITicketOrderItem = {
  id: string;
  eventTicketId: string;
  quantity: number;
  price: number;
  title: string;
};
