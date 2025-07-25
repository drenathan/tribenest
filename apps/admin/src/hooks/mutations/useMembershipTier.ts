import type {
  CreateMembershipBenefitInput,
  CreateMembershipTierInput,
} from "@/routes/_dashboard/tribe/membership-tiers/-components/schema";
import httpClient from "@/services/httpClient";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

export type UpdateMembershipTierInput = {
  id: string;
  name: string;
  description: string;
  profileId: string;
};

export type ReorderMembershipTiersInput = {
  profileId: string;
  membershipTierIds: string[];
};

export const useMembershipTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMembershipTierInput) => httpClient.post("/membership-tiers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-tiers"] });
    },
  });
};

export const useUpdateMembershipTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMembershipTierInput) => httpClient.put(`/membership-tiers/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-tiers"] });
    },
  });
};

export const useArchiveMembershipTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; profileId: string }) =>
      httpClient.post(`/membership-tiers/${data.id}/archive`, data, {
        params: {
          profileId: data.profileId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-tiers"] });
    },
  });
};

export const useUnarchiveMembershipTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; profileId: string }) =>
      httpClient.post(`/membership-tiers/${data.id}/unarchive`, data, {
        params: {
          profileId: data.profileId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-tiers"] });
    },
  });
};

export const useReorderMembershipTiers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReorderMembershipTiersInput) => httpClient.post("/membership-tiers/reorder", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-tiers"] });
    },
  });
};

export const useCreateMembershipBenefit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMembershipBenefitInput) => httpClient.post("/membership-benefits", data),
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
