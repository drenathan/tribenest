import { ITicket } from "@tribe-nest/frontend-shared";

export type ILiveEvent = {
  id: string;
  title: string;
  description: string;
  isPaid: boolean;
};

export type ILiveBroadcast = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  profileId: string;
  streamTemplateId: string;
  startedAt?: string;
  endedAt?: string;
  egressId: string;
  event: ILiveEvent;
  startDate?: string;
  generatedThumbnailUrl?: string;
  liveUrl?: string;
  vodUrl?: string;
  thumbnailUrl?: string;
  eventTickets?: ITicket[];
};
