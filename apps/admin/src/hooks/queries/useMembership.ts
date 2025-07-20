import httpClient from "@/services/httpClient";
import type { IMembership } from "@/types/membership";
import { useQuery } from "@tanstack/react-query";
import type { PaginatedData } from "@tribe-nest/frontend-shared";

type MembershipFilter = {
  membershipTierId?: string;
  query?: string;
  active?: string;
};

export const useGetProfileMemberships = (profileId?: string, page = 1, filter?: MembershipFilter) => {
  return useQuery<PaginatedData<IMembership>>({
    queryKey: ["memberships", profileId, page, filter],
    queryFn: async () => {
      const response = await httpClient.get("/memberships", {
        params: { profileId, page, limit: 10, filter },
      });
      return response.data;
    },
    enabled: !!profileId,
  });
};
