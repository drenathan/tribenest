import type { IMedia } from "@tribe-nest/frontend-shared";

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

export interface ITicket {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  archivedAt?: string;
  sold: number;
}

export interface CreateEventInput {
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
  actionText?: string;
  actionLink?: string;
  coverImage?: {
    file: string;
    fileSize: number;
    fileName: string;
  };
}

export interface UpdateEventInput {
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
  actionText?: string;
  actionLink?: string;
  coverImage?: {
    file: string;
    fileSize: number;
    fileName: string;
  };
}

export enum SceneLayout {
  Solo = "solo",
  Grid = "grid",
  // SideBySide = "side-by-side",
  PictureInPicture = "picture-in-picture",
  // Spotlight = "spotlight",
}

export enum SceneType {
  Camera = "camera",
  Media = "media",
  Countdown = "countdown",
}

export interface IScene {
  id: string;
  title: string;
  type: SceneType;
  layout: SceneLayout;
  logo?: {
    id: string;
    url: string;
  };
  background?: {
    type: "image" | "video";
    url: string;
    id: string;
  };
  overlay?: {
    type: "image" | "video";
    url: string;
    id: string;
  };
  currentTickerId?: string;
  currentBannerId?: string;
  currentComment?: IStreamBroadcastComment;
  countdown?: {
    duration: number;
    color?: string;
    fontFamily?: string;
  };
}

export interface ITicker {
  id: string;
  title: string;
}

export interface IBanner {
  id: string;
  title: string;
  subtitle: string;
}

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface IStreamTemplate {
  id: string;
  profileId: string;
  title: string;
  description: string;
  channelIds?: string[];
  config: {
    primaryColor: string;
    fontFamily: string;
    tickers: ITicker[];
    banners: IBanner[];
    selectedSceneId: string;
  };
  createdAt: string;
  updatedAt: string;
  scenes: IScene[];
  thumbnailUrl?: string;
}

export enum StreamChannelProvider {
  Youtube = "youtube",
  Twitch = "twitch",
  CustomRTMP = "custom_rtmp",
}

export interface IStreamChannel {
  id: string;
  profileId: string;
  externalId: string;
  title: string;
  channelProvider: StreamChannelProvider;
}

export interface IStreamTemplateChannel {
  id: string;
  streamTemplateId: string;
  streamChannelId: string;
}

export interface IStreamBroadcastComment {
  id: string;
  name: string;
  content: string;
  publishedAt: string;
  channelProvider: StreamChannelProvider;
}

export interface IStreamBroadcast {
  id: string;
  profileId: string;
  templateId: string;
  startedAt: string;
  endedAt: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
}
