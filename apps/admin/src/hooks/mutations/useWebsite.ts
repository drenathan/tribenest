import httpClient from "@/services/httpClient";
import type { WebsiteVersion } from "@/types/website";
import type { EditorTheme } from "@tribe-nest/frontend-shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type ActivateThemePayload = {
  theme: {
    pages: { pathname: string; json: string; title: string; description?: string }[];
    themeSettings: EditorTheme;
    slug: string;
    version: string;
    thumbnail: string;
  };
  profileId: string;
};

export type UpdateWebsiteVersionPayload = {
  pages: { pathname: string; content: string; title: string; description?: string }[];
  websiteVersionId: string;
  profileId: string;
  themeSettings: EditorTheme;
};

export const useActivateTheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ActivateThemePayload) => {
      const { data } = await httpClient.post("/websites/activate", payload);
      return data as WebsiteVersion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["websites"],
      });
    },
  });
};

export const useSaveWebsiteVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateWebsiteVersionPayload) => {
      const { data } = await httpClient.put(`/websites/${payload.websiteVersionId}`, payload);
      return data as WebsiteVersion;
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["websites", payload.websiteVersionId, payload.profileId],
      });
    },
  });
};
