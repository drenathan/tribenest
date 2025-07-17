import type { MembershipTier } from "../../../types";
import { useEditorContext } from "../../../components/editor/context";
import { useQuery } from "@tanstack/react-query";

export function useGetMembershipTiers() {
  const { profile, httpClient } = useEditorContext();

  return useQuery<MembershipTier[]>({
    queryKey: ["membership-tiers", profile?.id],
    queryFn: async () => {
      const res = await httpClient!.get("/public/membership-tiers", {
        params: {
          profileId: profile?.id,
        },
      });
      return res.data;
    },
    enabled: !!profile?.id && !!httpClient,
  });
}
