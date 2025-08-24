import httpClient from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";
import type { IWebsiteMessage, WebsiteVersion } from "@/types/website";
import type { PaginatedData } from "@tribe-nest/frontend-shared";

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
