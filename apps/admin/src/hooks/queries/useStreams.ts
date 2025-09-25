import httpClient from "@/services/httpClient";
import type { PaginatedData } from "@tribe-nest/frontend-shared";
import { useQuery } from "@tanstack/react-query";
import type { IStreamTemplate } from "@/types/event";

export const useGetStreamTemplates = (profileId?: string, page = 1) => {
  return useQuery<PaginatedData<IStreamTemplate>>({
    queryKey: ["stream-templates", profileId, page],
    queryFn: async () => {
      const response = await httpClient.get("/streams/templates", {
        params: { profileId, page, limit: 10 },
      });
      return response.data;
    },
    enabled: !!profileId,
  });
};

export const useGetStreamTemplate = (templateId?: string, profileId?: string) => {
  return useQuery<IStreamTemplate>({
    queryKey: ["stream-templates", profileId, templateId],
    queryFn: async () => {
      const response = await httpClient.get(`/streams/templates/${templateId}`, {
        params: { profileId },
      });
      return response.data;
    },
    enabled: !!profileId && !!templateId,
  });
};
