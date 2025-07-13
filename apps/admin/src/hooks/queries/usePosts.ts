import httpClient from "@/services/httpClient";
import type { IPost } from "@/types/post";
import type { PaginatedData } from "@tribe-nest/frontend-shared";
import { useQuery } from "@tanstack/react-query";

export const useGetPosts = (profileId?: string, page = 1) => {
  return useQuery<PaginatedData<IPost>>({
    queryKey: ["posts", profileId, page],
    queryFn: async () => {
      const response = await httpClient.get("/posts", {
        params: { profileId, page, limit: 10 },
      });
      return response.data;
    },
    enabled: !!profileId,
  });
};

export const useGetPost = (postId: string, profileId?: string) => {
  return useQuery<IPost>({
    queryKey: ["post", postId],
    queryFn: async () => {
      const response = await httpClient.get(`/posts/${postId}`, {
        params: { profileId },
      });
      return response.data;
    },
    enabled: !!postId && !!profileId,
  });
};
