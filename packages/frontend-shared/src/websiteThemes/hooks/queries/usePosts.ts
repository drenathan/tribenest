import type { IPublicPost, PaginatedData } from "../../../types";
import { useEditorContext } from "../../../components/editor/context";
import { useQuery } from "@tanstack/react-query";

export function useGetPosts() {
  const { profile, httpClient } = useEditorContext();

  return useQuery<PaginatedData<IPublicPost>>({
    queryKey: ["posts", profile?.id],
    queryFn: async () => {
      const res = await httpClient!.get("/public/posts", {
        params: {
          profileId: profile?.id,
        },
      });
      return res.data;
    },
    enabled: !!profile?.id && !!httpClient,
  });
}
