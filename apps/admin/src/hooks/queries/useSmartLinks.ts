import httpClient from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";
import type { PaginatedData, SmartLink } from "@tribe-nest/frontend-shared";

export type GetSmartLinksFilter = {
  query?: string;
  archived?: boolean;
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
