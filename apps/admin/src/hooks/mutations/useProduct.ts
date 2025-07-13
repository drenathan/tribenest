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
