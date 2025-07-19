import httpClient from "@/services/httpClient";
import type { IProduct } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export const useGetProduct = (productId?: string, profileId?: string) => {
  return useQuery<IProduct>({
    queryKey: ["product", productId, profileId],
    queryFn: async () => {
      const result = await httpClient.get(`/products/${productId}`, { params: { profileId } });
      return result.data;
    },
    enabled: !!productId && !!profileId,
  });
};
