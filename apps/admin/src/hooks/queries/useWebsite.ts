import httpClient from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";
import type { WebsiteVersion } from "@/types/website";

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
