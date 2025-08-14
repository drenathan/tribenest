import type { CreateProductInput, EditProductInput } from "@/routes/_dashboard/store/-components/schema";
import type { ExternalStoreProvider } from "@/types/product";

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

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: EditProductInput }) => {
      const result = await httpClient.put(`/products/${productId}`, data);
      return result.data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
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

export const useCreateProductStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { provider: ExternalStoreProvider; accessToken: string; profileId: string }) => {
      const result = await httpClient.post(`/products/stores`, data);
      return result.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-stores", variables.profileId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
