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

export type StorageType = "local" | "remote";
