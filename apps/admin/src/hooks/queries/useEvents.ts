import { useQuery } from "@tanstack/react-query";
import httpClient from "@/services/httpClient";
import type { IEvent } from "@/types/event";
import type { PaginatedData } from "@tribe-nest/frontend-shared";

type EventFilters = {
  query?: string;
  upcoming?: string;
  archived?: boolean;
};

export const useEvents = (profileId?: string, filter?: EventFilters, page?: number) => {
  return useQuery<PaginatedData<IEvent>>({
    queryKey: ["events", profileId, filter, page],
    queryFn: async () => {
      const response = await httpClient.get("/events", {
        params: {
          profileId,
          filter,
          page,
        },
      });
      return response.data;
    },
    enabled: !!profileId,
  });
};

export const useEvent = (eventId?: string, profileId?: string) => {
  return useQuery<IEvent>({
    queryKey: ["event", eventId, profileId],
    queryFn: async () => {
      const response = await httpClient.get(`/events/${eventId}`, { params: { profileId } });
      return response.data;
    },
    enabled: !!profileId && !!eventId,
  });
};
