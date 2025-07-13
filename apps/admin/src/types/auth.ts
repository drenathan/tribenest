import type { CreateAccountInput } from "@/routes/_auth/-components/schema";
import type { LoginInput } from "@/routes/_auth/-components/schema";

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

export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  paymentProvider: string;
  paymentProviderPublicKey: string;
}

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
