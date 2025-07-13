import httpClient from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";
import { type MembershipBenefit, type MembershipTier } from "@/types/membership";

export const useMembershipTiers = (profileId?: string) => {
  return useQuery<MembershipTier[]>({
    queryKey: ["membership-tiers", profileId],
    queryFn: async () => {
      const response = await httpClient.get("/membership-tiers", {
        params: { profileId },
      });
      return response.data;
    },
    enabled: !!profileId,
  });
};

export const useGetMembershipBenefits = (profileId?: string) => {
  return useQuery<MembershipBenefit[]>({
    queryKey: ["membership-benefits", profileId],
    queryFn: async () => {
      const response = await httpClient.get("/membership-benefits", {
        params: { profileId },
      });
      return response.data;
    },
    enabled: !!profileId,
  });
};
