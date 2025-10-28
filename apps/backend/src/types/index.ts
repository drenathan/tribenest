import { Services } from "@src/services";
import { Request } from "express";

export * from "./route";

export const DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
export type PolicyFunction = (req: Request, services: Services) => Promise<boolean> | boolean;
export enum MediaType {
  Image = "image",
  Video = "video",
  Audio = "audio",
}

export type PaginatedData<T> = {
  data: T[];
  total: number;
  hasNextPage: boolean;
  page: number;
  nextPage: number | null;
  pageSize: number;
};

export enum Deployment {
  Worker = "worker",
  Server = "server",
}

export type Locale = "en" | "de";
export type GoogleOAuthData = {
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
};

export type GoogleOAuthCredentials = {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
};

export type TwitchOAuthCredentials = {
  access_token: string;
  refresh_token: string;
  scope: string[];
  token_type: string;
  expires_in: number;
};

export type TwitchUser = {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
  email: string;
};
