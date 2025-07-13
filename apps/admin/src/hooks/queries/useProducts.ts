import httpClient from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";
import type { IProduct, ProductCategory } from "@/types/product";
import type { PaginatedData } from "@tribe-nest/frontend-shared";

export const useGetProducts = (profileId?: string, category?: ProductCategory) => {
  return useQuery<PaginatedData<IProduct>>({
    queryKey: ["products", profileId, category],
    queryFn: async () => {
      const response = await httpClient.get("/products", {
        params: { profileId, category },
      });
      return response.data;
    },
    enabled: !!profileId && !!category,
  });
};
