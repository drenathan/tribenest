import httpClient from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";
import type { IProduct, IProductStore, ProductCategory } from "@/types/product";
import type { PaginatedData } from "@tribe-nest/frontend-shared";

export type GetProductsFilter = {
  query?: string;
  archived?: boolean;
  futureRelease?: boolean;
  releaseType?: "album" | "single" | "all";
};

export const useGetProducts = (
  profileId?: string,
  category?: ProductCategory,
  page = 1,
  filter?: GetProductsFilter,
) => {
  return useQuery<PaginatedData<IProduct>>({
    queryKey: ["products", profileId, category, page, filter],
    queryFn: async () => {
      const response = await httpClient.get("/products", {
        params: {
          profileId,
          category,
          page,
          limit: 10,
          filter,
        },
      });
      return response.data;
    },
    enabled: !!profileId && !!category,
  });
};

export const useGetProductStores = (profileId?: string) => {
  return useQuery<IProductStore[]>({
    queryKey: ["product-stores", profileId],
    queryFn: async () => {
      const response = await httpClient.get("/products/stores", { params: { profileId } });
      return response.data;
    },
    enabled: !!profileId,
  });
};
