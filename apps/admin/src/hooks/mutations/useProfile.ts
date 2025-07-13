import type { CreateProfileInput } from "@/routes/_dashboard/-components/schema";
import httpClient from "@/services/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProfileInput) => httpClient.post("/profiles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile-authorizations"],
      });
    },
  });
};

export const useValidateSubdomain = () => {
  return useMutation({
    mutationFn: async (subdomain: string) => {
      const { data } = await httpClient.post("/profiles/validate-subdomain", {
        subdomain,
      });
      return data as boolean;
    },
  });
};
