import { type UserComponent } from "@craftjs/core";
import type { IPublicProduct } from "../../../types";
import { useEditorContext } from "../../../components/editor/context";
import { Music } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { EditorText } from "../../../components/editor/selectors";
import { addAlphaToHexCode } from "../../../lib/utils";

interface PostItemProps {
  product: IPublicProduct;
}

export const MusicItem: UserComponent<PostItemProps> = ({ product }) => {
  const { themeSettings, profile, navigate } = useEditorContext();
  const defaultVariant = product.variants.find((variant) => variant.isDefault);
  const isSingle = defaultVariant?.tracks?.length === 1;
  const coverImage =
    product.media.find((m) => m.type === "image")?.url || defaultVariant?.media.find((m) => m.type === "image")?.url;

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
          navigate(`/products/${product.id}`);
        }}
      >
        <EditorText preventEdit text={product.title} fontSize="20" fontSizeMobile="16" fontWeight="bold" />

        <EditorText
          color={addAlphaToHexCode(themeSettings.colors.text, 0.7)}
          preventEdit
          text={profile?.name}
          fontSize="16"
          fontSizeMobile="14"
          fontWeight="normal"
        />

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
      </div>
    </div>
  );
};

MusicItem.craft = {
  name: "MusicItem",
  custom: {
    preventDelete: true,
  },
};
