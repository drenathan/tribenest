import type {
  CreateMembershipBenefitInput,
  CreateMembershipTierInput,
} from "@/routes/_dashboard/tribe/membership-tiers/-components/schema";
import httpClient from "@/services/httpClient";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

export const useMembershipTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMembershipTierInput) => httpClient.post("/membership-tiers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-tiers"] });
    },
  });
};

export const useCreateMembershipBenefit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMembershipBenefitInput) => {
      const result = await httpClient.post("/membership-benefits", data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-benefits"] });
    },
  });
};

export const useUpdateMembershipTierBenefits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { tierId: string; benefits: string[]; profileId: string }) => {
      const result = await httpClient.put(`/membership-tiers/${data.tierId}/benefits`, data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-tiers"] });
    },
  });
};
