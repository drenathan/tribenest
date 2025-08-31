export type TrackEventInput = {
  path: string;
  eventType: string;
  eventData: Record<string, any>;
  ip?: string;
};
