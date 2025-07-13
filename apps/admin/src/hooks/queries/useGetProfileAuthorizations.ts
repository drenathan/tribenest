import httpClient from "@/services/httpClient";
import type { ProfileAuthorization } from "@/types/auth";
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
