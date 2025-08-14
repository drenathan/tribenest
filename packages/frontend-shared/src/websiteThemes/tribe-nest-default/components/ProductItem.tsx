import { type UserComponent } from "@craftjs/core";
import { ProductCategory, type IPublicProduct } from "../../../types";
import { useEditorContext } from "../../../components/editor/context";
import { Music } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { EditorText } from "../../../components/editor/selectors";
import { addAlphaToHexCode } from "../../../lib/utils";
import { useMemo } from "react";

interface PostItemProps {
  product: IPublicProduct;
}

export const ProductItem: UserComponent<PostItemProps> = ({ product }) => {
  const { themeSettings, profile, navigate } = useEditorContext();
  const defaultVariant = product.variants.find((variant) => variant.isDefault) || product.variants[0];
  const isSingle = defaultVariant?.tracks?.length === 1;
  const coverImage =
    product.media.find((m) => m.type === "image")?.url || defaultVariant?.media.find((m) => m.type === "image")?.url;
  const isMusic = product.category === ProductCategory.Music;

  const { priceLabel, variantCount } = useMemo(() => {
    const prices = (product.variants || []).map((v) => v.price).filter((p): p is number => typeof p === "number");
    const min = Math.min(...(prices.length ? prices : [0]));
    const max = Math.max(...(prices.length ? prices : [0]));
    const label = min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
    return { priceLabel: label, variantCount: product.variants?.length || 0 };
  }, [product]);

  if (!defaultVariant) {
    return null;
  }

  return (
    <div className="w-full">
      <div
        className="overflow-hidden shadow-lg"
        style={{
          borderRadius: `${themeSettings.cornerRadius}px`,
        }}
      >
        {coverImage ? (
          <img src={coverImage} alt={product.title} className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Music className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
      </div>
      <div
        className="inline-flex flex-col mt-2 cursor-pointer hover:underline w-auto"
        role="link"
        onClick={() => {
          navigate(`/music/${product.id}`);
        }}
      >
        <EditorText preventEdit text={product.title} fontSize="20" fontSizeMobile="16" fontWeight="bold" />

        {!isMusic && <EditorText preventEdit text={priceLabel} fontSize="16" fontSizeMobile="14" fontWeight="normal" />}

        {isMusic && (
          <EditorText
            color={addAlphaToHexCode(themeSettings.colors.text, 0.7)}
            preventEdit
            text={product.artist || profile?.name}
            fontSize="16"
            fontSizeMobile="14"
            fontWeight="normal"
          />
        )}
        {isMusic && (
          <div className="flex items-center gap-2 mt-2">
            {isSingle ? (
              <Badge
                style={{
                  backgroundColor: addAlphaToHexCode(themeSettings.colors.text, 0.1),
                  color: themeSettings.colors.text,
                }}
                variant="outline"
              >
                Single
              </Badge>
            ) : (
              <Badge
                style={{
                  backgroundColor: addAlphaToHexCode(themeSettings.colors.text, 0.1),
                  color: themeSettings.colors.text,
                }}
                variant="outline"
              >
                Album: {defaultVariant?.tracks?.length || 0} tracks
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ProductItem.craft = {
  name: "ProductItem",
  custom: {
    preventDelete: true,
  },
};
