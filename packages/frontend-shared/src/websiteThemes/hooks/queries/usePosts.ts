import type { IPublicPost, PaginatedData } from "../../../types";
import { useEditorContext } from "../../../components/editor/context";
import { useQuery } from "@tanstack/react-query";

export interface GetPostsParams {
  query?: string;
  type?: string;
  membershipTierId?: string;
  page?: number;
}

export function useGetPosts(params?: GetPostsParams) {
  const { profile, httpClient } = useEditorContext();

  return useQuery<PaginatedData<IPublicPost>>({
    queryKey: ["posts", profile?.id, params],
    queryFn: async () => {
      const res = await httpClient!.get("/public/posts", {
        params: {
          profileId: profile?.id,
          page: params?.page || 1,
          limit: 10,
          filter: {
            query: params?.query,
            type: params?.type,
            membershipTierId: params?.membershipTierId,
          },
        },
      });
      return res.data;
    },
    enabled: !!profile?.id && !!httpClient,
  });
}
