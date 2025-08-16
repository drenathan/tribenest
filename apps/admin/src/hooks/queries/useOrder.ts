import httpClient from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";
import type { IPublicOrder, PaginatedData } from "@tribe-nest/frontend-shared";
type OrderFilter = {
  status?: string;
  query?: string;
};
export const useGetOrders = (profileId?: string, page = 1, filter?: OrderFilter) => {
  return useQuery<PaginatedData<IPublicOrder>>({
    queryKey: ["orders", profileId, page, filter],
    queryFn: async () => {
      const result = await httpClient.get(`/orders`, { params: { profileId, page, filter } });
      return result.data;
    },
    enabled: !!profileId,
  });
};

export const useGetOrder = (orderId?: string, profileId?: string) => {
  return useQuery<IPublicOrder>({
    queryKey: ["order", orderId, profileId],
    queryFn: async () => {
      const result = await httpClient.get(`/orders/${orderId}`, { params: { profileId } });
      return result.data;
    },
    enabled: !!orderId && !!profileId,
  });
};
