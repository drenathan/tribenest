import httpClient from "@/services/httpClient";
import type { IStreamTemplate } from "@/types/event";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
