"use client";
import { type UserComponent, useNode } from "@craftjs/core";
import { FeaturedMusicSectionSettings } from "./Settings";
import { type IPublicProduct, ProductCategory } from "../../../../types";
import { useEditorContext } from "../../context";
import { useEffect, useState } from "react";
import { addAlphaToHexCode } from "../../../../lib/utils";
import { Badge } from "../../../ui/badge";
import { Music } from "lucide-react";

type FeaturedMusicSectionProps = {
  title: string;
};

export const FeaturedMusicSection: UserComponent<FeaturedMusicSectionProps> = ({
  title,
}: FeaturedMusicSectionProps) => {
  const [products, setProducts] = useState<IPublicProduct[]>([]);
  const { httpClient, themeSettings, profile, navigate } = useEditorContext();

  const {
    connectors: { connect },
  } = useNode();

  useEffect(() => {
    httpClient
      ?.get(`/public/products/featured`, {
        params: {
          profileId: profile?.id,
          category: ProductCategory.Music,
        },
      })
      .then((res) => {
        setProducts(res.data);
      });
  }, [httpClient, profile?.id]);

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(ref);
        }
      }}
      className="w-full @md:p-8 p-4 flex flex-col items-center"
    >
      <h1 className="text-2xl font-bold text-center @md:text-left mb-6">{title}</h1>

      <div className="flex gap-6 w-full overflow-x-auto pb-8 justify-start">
        {products.map((product) => {
          const defaultVariant = product.variants.find((variant) => variant.isDefault);
          const isSingle = defaultVariant?.tracks?.length === 1;
          const coverImage =
            product.media.find((m) => m.type === "image")?.url ||
            defaultVariant?.media.find((m) => m.type === "image")?.url;

          return (
            <div className="w-70 shrink-0" key={product.id}>
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
                <p className="font-bold">{product.title}</p>
                <p
                  style={{
                    color: addAlphaToHexCode(themeSettings.colors.text, 0.4),
                  }}
                  className="text-sm"
                >
                  {product.artist ?? profile?.name}
                </p>

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
        })}
      </div>
    </div>
  );
};

FeaturedMusicSection.craft = {
  displayName: "Featured Music",
  props: {
    title: "Buy my music",
  },
  related: {
    toolbar: FeaturedMusicSectionSettings,
  },
};
