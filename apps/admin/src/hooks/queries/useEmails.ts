import httpClient from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";
import type { IEmailList, IEmailTemplate, PaginatedData } from "@tribe-nest/frontend-shared";

export type GetEmailListsFilter = {
  query?: string;
};

export const useGetEmailLists = (profileId?: string, page = 1, filter?: GetEmailListsFilter) => {
  return useQuery<PaginatedData<IEmailList>>({
    queryKey: ["email-lists", profileId, page, filter],
    queryFn: async () => {
      const response = await httpClient.get("/emails/lists", {
        params: {
          profileId,
          page,
          limit: 10,
          filter,
        },
      });
      return response.data;
    },
    enabled: !!profileId,
  });
};
export type GetEmailTemplatesFilter = {
  query?: string;
};

export const useGetEmailTemplates = (profileId?: string, page = 1, filter?: GetEmailTemplatesFilter) => {
  return useQuery<PaginatedData<IEmailTemplate>>({
    queryKey: ["email-templates", profileId, page, filter],
    queryFn: async () => {
      const response = await httpClient.get("/emails/templates", {
        params: {
          profileId,
          page,
          limit: 10,
          filter,
        },
      });
      return response.data;
    },
    enabled: !!profileId,
  });
};

export const useGetEmailList = (emailListId?: string, profileId?: string) => {
  return useQuery<IEmailList>({
    queryKey: ["email-lists", profileId, emailListId],
    queryFn: async () => {
      const response = await httpClient.get(`/emails/lists/${emailListId}`, {
        params: {
          profileId,
        },
      });
      return response.data;
    },
    enabled: !!profileId && !!emailListId,
  });
};

export const useGetEmailTemplate = (emailTemplateId?: string, profileId?: string) => {
  return useQuery<IEmailTemplate>({
    queryKey: ["email-templates", profileId, emailTemplateId],
    queryFn: async () => {
      const response = await httpClient.get(`/emails/templates/${emailTemplateId}`, {
        params: {
          profileId,
        },
      });
      return response.data;
    },
    enabled: !!profileId && !!emailTemplateId,
  });
};
