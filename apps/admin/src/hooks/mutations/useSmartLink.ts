import httpClient from "@/services/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EditorTheme, SmartLink } from "@tribe-nest/frontend-shared";

export type CreateSmartLinkPayload = {
  themeSettings: EditorTheme;
  path: string;
  template?: string;
  thumbnail?: string;
  title: string;
  description?: string;
  content?: string;
  profileId: string;
};
export type UpdateSmartLinkPayload = {
  themeSettings: EditorTheme;
  path: string;
  thumbnail?: string;
  title: string;
  description?: string;
  content: string;
  profileId: string;
  smartLinkId: string;
};

export const useCreateSmartLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSmartLinkPayload) => {
      const { data } = await httpClient.post("/smart-links", payload);
      return data as SmartLink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["smart-links"],
      });
    },
  });
};

export const useUpdateSmartLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateSmartLinkPayload) => {
      const { data } = await httpClient.put(`/smart-links/${payload.smartLinkId}`, payload);
      return data as SmartLink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["smart-links"],
      });
    },
  });
};

export const useArchiveSmartLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (smartLinkId: string) => {
      const { data } = await httpClient.post(`/smart-links/${smartLinkId}/archive`);
      return data as SmartLink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["smart-links"],
      });
    },
  });
};

export const useUnarchiveSmartLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (smartLinkId: string) => {
      const { data } = await httpClient.post(`/smart-links/${smartLinkId}/unarchive`);
      return data as SmartLink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["smart-links"],
      });
    },
  });
};
