import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import httpClient from "@/services/httpClient";
import type { CreateEventInput, UpdateEventInput } from "@/types/event";

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventInput) => httpClient.post("/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEventInput) => httpClient.put("/events", data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
  });
};

export const useArchiveEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; profileId: string }) =>
      httpClient.post(`/events/${data.id}/archive`, data, {
        params: {
          profileId: data.profileId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useUnarchiveEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; profileId: string }) =>
      httpClient.post(`/events/${data.id}/unarchive`, data, {
        params: {
          profileId: data.profileId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
