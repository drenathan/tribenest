import httpClient from "@/services/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IEmailList, IEmailTemplate } from "@tribe-nest/frontend-shared";

export type CreateEmailListPayload = {
  title: string;
  profileId: string;
  isDefault?: boolean;
};

export type UpdateEmailListPayload = {
  title: string;
  profileId: string;
  emailListId: string;
  isDefault?: boolean;
};

export type CreateEmailTemplatePayload = {
  title: string;
  profileId: string;
  content: string;
};

export type UpdateEmailTemplatePayload = {
  title: string;
  profileId: string;
  emailTemplateId: string;
  content: string;
};

export const useCreateEmailList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateEmailListPayload) => {
      const { data } = await httpClient.post("/emails/lists", payload);
      return data as IEmailList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["email-lists"],
      });
    },
  });
};

export const useUpdateEmailList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateEmailListPayload) => {
      const { data } = await httpClient.put(`/emails/lists/${payload.emailListId}`, payload);
      return data as IEmailList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["email-lists"],
      });
    },
  });
};

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateEmailTemplatePayload) => {
      const { data } = await httpClient.post("/emails/templates", payload);
      return data as IEmailTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["email-templates"],
      });
    },
  });
};

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateEmailTemplatePayload) => {
      const { data } = await httpClient.put(`/emails/templates/${payload.emailTemplateId}`, payload);
      return data as IEmailTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["email-templates"],
      });
    },
  });
};
