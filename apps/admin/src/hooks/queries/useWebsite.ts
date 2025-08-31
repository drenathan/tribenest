import httpClient from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";
import type { IWebsiteAnalytics, IWebsiteMessage, WebsiteVersion } from "@/types/website";
import type { PaginatedData } from "@tribe-nest/frontend-shared";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

export const useGetWebsites = (profileId?: string) => {
  return useQuery<WebsiteVersion[]>({
    queryKey: ["websites", profileId],
    queryFn: async () => {
      const response = await httpClient.get("/websites", {
        params: { profileId },
      });
      return response.data;
    },
    enabled: !!profileId,
  });
};

export const useGetWebsiteVersion = (websiteVersionId: string, profileId?: string) => {
  return useQuery<WebsiteVersion>({
    queryKey: ["websites", websiteVersionId, profileId],
    queryFn: async () => {
      const response = await httpClient.get(`/websites/${websiteVersionId}`, {
        params: { profileId },
      });
      return response.data;
    },
    enabled: !!websiteVersionId && !!profileId,
  });
};

type Filter = {
  page: number;
};

export const useWebsitesMessages = (profileId?: string, filter?: Filter) => {
  return useQuery<PaginatedData<IWebsiteMessage>>({
    queryKey: ["websites", profileId, filter],
    queryFn: async () => {
      const response = await httpClient.get("/websites/messages", {
        params: { profileId, ...filter },
      });
      return response.data;
    },
    enabled: !!profileId,
  });
};

export const useGetWebsiteAnalytics = (profileId?: string, date?: DateRange | undefined) => {
  const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : undefined;
  const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : undefined;

  return useQuery<IWebsiteAnalytics>({
    queryKey: ["smart-links", profileId, "analytics", startDate, endDate],
    queryFn: async () => {
      const response = await httpClient.get(`/websites/analytics`, {
        params: { profileId, startDate, endDate },
      });
      return response.data;
    },
    enabled: !!profileId && !!date?.from && !!date?.to,
  });
};
