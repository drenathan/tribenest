import type { IPublicProduct, PaginatedData, ProductCategory } from "../../../types";
import { useEditorContext } from "../../../components/editor/context";
import { useQuery } from "@tanstack/react-query";

export function useGetProducts(category: ProductCategory) {
  const { profile, httpClient } = useEditorContext();

  return useQuery<PaginatedData<IPublicProduct>>({
    queryKey: ["products", profile?.id, category],
    queryFn: async () => {
      const res = await httpClient!.get("/public/products", {
        params: {
          profileId: profile?.id,
          category,
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
