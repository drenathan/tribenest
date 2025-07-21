import { getSmartLink } from "../../[subdomain]/_api";
import { LinkRenderer } from "./_components/link-renderer";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ path: string }> }): Promise<Metadata> {
  const { path } = await params;
  const smartLink = await getSmartLink({ path });

  if (!smartLink) {
    return {
      title: "Tribe Nest",
      description: "The all in one platform for artists",
    };
  }

  return {
    title: smartLink.title,
    description: smartLink.description,
    openGraph: {
      title: smartLink.title,
      description: smartLink.description,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  const smartLink = await getSmartLink({ path });

  if (!smartLink) {
    return <div>404</div>;
  }

  return <LinkRenderer smartLink={smartLink} />;
}
