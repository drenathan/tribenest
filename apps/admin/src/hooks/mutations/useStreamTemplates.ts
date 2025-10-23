import httpClient from "@/services/httpClient";
import type { IStreamTemplate } from "@/types/event";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@tribe-nest/frontend-shared";
import { toast } from "sonner";

export type CreateStreamTemplatePayload = {
  profileId: string;
  title: string;
  description?: string;
  config: IStreamTemplate["config"];
  scenes: IStreamTemplate["scenes"];
};

export type UpdateStreamTemplatePayload = {
  profileId: string;
  templateId: string;
  title: string;
  description?: string;
};

export const useCreateStreamTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateStreamTemplatePayload) => {
      const { data } = await httpClient.post("/streams/templates", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stream-templates"],
      });
    },
  });
};

export const useUpdateStreamTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateStreamTemplatePayload) => {
      const { data } = await httpClient.put(`/streams/templates/${payload.templateId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stream-templates"],
      });
    },
  });
};

export type UpdateTemplateChannelsPayload = {
  templateId: string;
  profileId: string;
  channelIds: string[];
};

export const useUpdateTemplateChannels = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateTemplateChannelsPayload) => {
      const { data } = await httpClient.put(`/streams/templates/${payload.templateId}/channels`, payload);
      return data;
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["stream-template-channels", payload.templateId],
      });
    },
    onError: (error) => {
      const errorMessage =
        (error as unknown as ApiError).response?.data?.message || "Failed to update template channels";
      toast.error(errorMessage);
    },
  });
};
