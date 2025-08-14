"use client";
import { useGetProduct } from "../../hooks/queries/useProducts";
import { useEditorContext } from "../../../components/editor/context";

import { ProductCategory } from "../../../types";
import { MusicItemDetails } from "./MusicItemDetails";
import { Music } from "lucide-react";
import { ProductDetails } from "./ProductDetails";

export function MusicDetailsContent() {
  const { currentProductId, themeSettings } = useEditorContext();
  const { data: product, isLoading } = useGetProduct(currentProductId);

  if (isLoading || !product) {
    return (
      <div
        className="w-full flex flex-col items-center px-2 @md:px-8 min-h-screen pb-14"
        style={{
          backgroundColor: themeSettings.colors.background,
          color: themeSettings.colors.text,
          fontFamily: themeSettings.fontFamily,
        }}
      >
        <div className="flex items-center justify-center h-64">
          <Music className="w-12 h-12 animate-spin" style={{ color: themeSettings.colors.primary }} />
        </div>
      </div>
    );
  }

  if (product.category === ProductCategory.Music) {
    return <MusicItemDetails product={product} />;
  }

  return <ProductDetails product={product} />;
}

MusicDetailsContent.craft = {
  name: "MusicDetailsContent",
  custom: {
    preventDelete: true,
  },
};
