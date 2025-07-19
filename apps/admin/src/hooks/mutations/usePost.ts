import type { CreatePostInput, UpdatePostInput } from "@/routes/_dashboard/tribe/posts/-components/schema";
import httpClient from "@/services/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePostInput) => {
      const result = await httpClient.post("/posts", data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, ...data }: UpdatePostInput) => {
      const result = await httpClient.put(`/posts/${postId}`, data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useArchivePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, profileId }: { postId: string; profileId: string }) => {
      const result = await httpClient.delete(`/posts/${postId}`, {
        params: {
          profileId,
        },
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useUnarchivePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, profileId }: { postId: string; profileId: string }) => {
      const result = await httpClient.post(
        `/posts/${postId}/unarchive`,
        { profileId },
        {
          params: {
            profileId,
          },
        },
      );
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
