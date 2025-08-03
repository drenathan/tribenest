import httpClient from "@/services/httpClient";
import type { IProfileConfiguration, ProfileAuthorization, ProfileOnboarding } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";

export function useGetProfileAuthorizations() {
  return useQuery<ProfileAuthorization[]>({
    queryKey: ["profile-authorizations"],
    queryFn: async () => {
      const response = await httpClient.get("/accounts/authorizations");
      return response.data;
    },
  });
}

export function useGetProfileOnboarding(profileId?: string) {
  return useQuery<ProfileOnboarding[]>({
    queryKey: ["profile-onboarding", profileId],
    queryFn: async () => {
      const response = await httpClient.get(`/profiles/${profileId}/onboarding`);
      return response.data;
    },
    enabled: !!profileId,
  });
}

export function useGetProfileConfiguration(profileId?: string) {
  return useQuery<IProfileConfiguration>({
    queryKey: ["profile-configuration", profileId],
    queryFn: async () => {
      const response = await httpClient.get(`/profiles/${profileId}/configuration`);
      return response.data;
    },
    enabled: !!profileId,
  });
}
