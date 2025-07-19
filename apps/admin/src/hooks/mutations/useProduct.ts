import type { CreateProductInput } from "@/routes/_dashboard/store/music/-components/schema";
import httpClient from "@/services/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const result = await httpClient.post("/products", data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useArchiveProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, profileId }: { productId: string; profileId: string }) => {
      const result = await httpClient.delete(`/products/${productId}`, { params: { profileId } });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUnarchiveProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, profileId }: { productId: string; profileId: string }) => {
      const result = await httpClient.post(`/products/${productId}/unarchive`, { profileId });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
