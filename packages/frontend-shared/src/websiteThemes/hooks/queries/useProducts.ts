import type { IPublicProduct, PaginatedData, ProductCategory } from "../../../types";
import { useEditorContext } from "../../../components/editor/context";
import { useQuery } from "@tanstack/react-query";

export interface GetProductsParams {
  query?: string;
  category?: ProductCategory;
  page?: number;
  releaseType?: "album" | "single" | "all";
}

export function useGetProducts(params?: GetProductsParams) {
  const { profile, httpClient } = useEditorContext();

  return useQuery<PaginatedData<IPublicProduct>>({
    queryKey: ["products", profile?.id, params],
    queryFn: async () => {
      const res = await httpClient!.get("/public/products", {
        params: {
          profileId: profile?.id,
          category: params?.category,
          page: params?.page || 1,
          limit: 10,
          filter: {
            query: params?.query,
            releaseType: params?.releaseType,
          },
        },
      });
      return res.data;
    },
    enabled: !!profile?.id && !!httpClient,
  });
}

export function useGetProduct(productId?: string) {
  const { profile, httpClient } = useEditorContext();

  return useQuery<IPublicProduct>({
    queryKey: ["products", profile?.id, { productId }],
    queryFn: async () => {
      const res = await httpClient!.get(`/public/products/${productId}`, {
        params: {
          profileId: profile?.id,
        },
      });
      return res.data;
    },
    enabled: !!profile?.id && !!httpClient && !!productId,
  });
}
