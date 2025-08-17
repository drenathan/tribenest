import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import httpClient from "@/services/httpClient";
import type { CreateEventInput, UpdateEventInput } from "@/types/event";

export interface CreateTicketInput {
  title: string;
  description: string;
  price: number;
  quantity: number;
  profileId: string;
}

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

// Ticket mutations
export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTicketInput & { eventId: string }) =>
      httpClient.post(`/events/${data.eventId}/tickets`, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTicketInput & { eventId: string; ticketId: string }) =>
      httpClient.put(`/events/${data.eventId}/tickets/${data.ticketId}`, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
};

export const useArchiveTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
    mutationFn: (data: { eventId: string; ticketId: string; profileId: string }) =>
      httpClient.post(`/events/${data.eventId}/tickets/${data.ticketId}/archive`, data, {
        params: {
          profileId: data.profileId,
        },
      }),
  });
};

export const useUnarchiveTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
    mutationFn: (data: { eventId: string; ticketId: string; profileId: string }) =>
      httpClient.post(`/events/${data.eventId}/tickets/${data.ticketId}/unarchive`, data, {
        params: {
          profileId: data.profileId,
        },
      }),
  });
};
