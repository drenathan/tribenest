import type { CreateAccountInput } from "@/routes/_auth/-components/schema";
import type { LoginInput } from "@/routes/_auth/-components/schema";
import type { PaymentProviderName, Profile } from "@tribe-nest/frontend-shared";

export interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  kind: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}
export type UpdateLocalUserPayload = Pick<AuthUser, "firstName">;

export type ProjectUser = {
  id: string;
  email: string;
  status: string;
  isOwner: boolean;
  firstName: string;
};

export interface ProfileAuthorization {
  accountId: string;
  profileId: string;
  isOwner: boolean;
  profile: Profile;
}

export interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  errorMessage: string | null;
  currentProfileAuthorization: ProfileAuthorization | null;
  setCurrentProfileAuthorization: (profileAuth: ProfileAuthorization) => void;
  initialize: () => Promise<boolean>;
}
export interface AuthContextType extends AuthState {
  login: (data: LoginInput) => Promise<void>;
  register: (data: CreateAccountInput) => Promise<void>;

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

export interface ProfileOnboarding {
  id: ProfileOnboardingStepId;
  step: number;
  title: string;
  description: string;
  actionText: string;
  actionPath: string;
  helpLink: string;
  completedAt: string | null;
}

export enum ProfileOnboardingStepId {
  FileStorage = "file-storage-configuration",
  EmailConfiguration = "email-configuration",
  PaymentConfiguration = "payment-configuration",
  ProfileAddress = "profile-address",
  MembershipTier = "membership-tiers",
  WebsiteConfiguration = "website-configuration",
  CreateFirstPost = "create-first-post",
  UploadFirstMusic = "upload-first-music",
  PWAConfiguration = "pwa-configuration",
}

export type IProfileConfiguration = {
  pwaConfig: {
    name: string;
    shortName: string;
    description: string;
    icon192: string;
    icon512: string;
    icon96: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  smtpFrom: string;
  paymentProviderName: PaymentProviderName;
  paymentProviderPublicKey: string;
  paymentProviderPrivateKey: string;
  paymentProviderWebhookSecret: string;
};
