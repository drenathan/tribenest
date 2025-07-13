"use client";
import { type UserComponent, useNode } from "@craftjs/core";
import { FeaturedMusicSectionSettings } from "./Settings";

type FeaturedMusicSectionProps = {
  title: string;
};

export const FeaturedMusicSection: UserComponent<FeaturedMusicSectionProps> = ({
  title,
}: FeaturedMusicSectionProps) => {
  // const [products, setProducts] = useState<IProduct[]>([]);
  // const { httpClient, profile } = useEditorContext();

  const {
    connectors: { connect },
  } = useNode();

  // useEffect(() => {
  //   httpClient
  //     ?.get(`/public/featured-products`, {
  //       params: {
  //         profileId: profile?.id,
  //         category: ProductCategory.Music,
  //       },
  //     })
  //     .then((res) => {
  //       setProducts(res.data);
  //     });
  // }, [httpClient, profile?.id]);

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(ref);
        }
      }}
      className="w-full @md:p-8 p-4"
    >
      <h1 className="text-2xl font-bold text-center @md:text-left mb-4">{title}</h1>

      <div className="flex gap-4 flex-col @md:flex-row w-full flex-wrap"></div>
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
