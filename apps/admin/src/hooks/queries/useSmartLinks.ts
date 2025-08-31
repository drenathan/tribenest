import httpClient from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";
import type { PaginatedData, SmartLink } from "@tribe-nest/frontend-shared";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

export type GetSmartLinksFilter = {
  query?: string;
  archived?: boolean;
};

export type SmartLinkAnalytics = {
  analytics: {
    totalEvents: number;
    views: number;
    clicks: number;
  };
  countries: {
    country: string;
    views: number;
    clicks: number;
  }[];
  cities: {
    city: string;
    views: number;
    clicks: number;
  }[];
};

export const useGetSmartLinks = (profileId?: string, page = 1, filter?: GetSmartLinksFilter) => {
  return useQuery<PaginatedData<SmartLink>>({
    queryKey: ["smart-links", profileId, page, filter],
    queryFn: async () => {
      const response = await httpClient.get("/smart-links", {
        params: {
          profileId,
          page,
          limit: 10,
          filter,
        },
      });
      return response.data;
    },
    enabled: !!profileId,
  });
};

export const useGetSmartLink = (smartLinkId?: string, profileId?: string) => {
  return useQuery<SmartLink>({
    queryKey: ["smart-links", profileId, smartLinkId],
    queryFn: async () => {
      const response = await httpClient.get(`/public/smart-links`, {
        params: {
          profileId,
          id: smartLinkId,
        },
      });
      return response.data;
    },
    enabled: !!profileId && !!smartLinkId,
  });
};

export const useGetSmartLinkAnalytics = (smartLinkId?: string, profileId?: string, date?: DateRange | undefined) => {
  const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : undefined;
  const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : undefined;

  return useQuery<SmartLinkAnalytics>({
    queryKey: ["smart-links", profileId, smartLinkId, "analytics", startDate, endDate],
    queryFn: async () => {
      const response = await httpClient.get(`/smart-links/${smartLinkId}/analytics`, {
        params: { profileId, startDate, endDate },
      });
      return response.data;
    },
    enabled: !!profileId && !!smartLinkId && !!date?.from && !!date?.to,
  });
};
