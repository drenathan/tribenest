import { isUUID } from "@/lib/utils";
import { getWebPage } from "../../_api";
import { PageRenderer } from "../../_components/page-renderer";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string; path: string; subpath: string }>;
}): Promise<Metadata> {
  const { subdomain, path, subpath } = await params;
  const subpathIsUUID = isUUID(subpath);
  const subpathPathname = subpathIsUUID ? `/:id` : `/${subpath}`;
  const webPage = await getWebPage({ subdomain, pathname: `/${path}${subpathPathname}` });

  if (!webPage) {
    return {
      title: "Tribe Nest",
      description: "The all in one platform for artists",
    };
  }

  return {
    title: webPage.page.title,
    description: webPage.page.description,
    openGraph: {
      title: webPage.page.title,
      description: webPage.page.description,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ subdomain: string; path: string; subpath: string }>;
}) {
  const { subdomain, path, subpath } = await params;
  const subpathIsUUID = isUUID(subpath);
  const subpathPathname = subpathIsUUID ? `/:id` : `/${subpath}`;

  const webPage = await getWebPage({ subdomain, pathname: `/${path}${subpathPathname}` });

  if (!webPage) {
    return <div>404</div>;
  }

  return <PageRenderer webPage={webPage} paramId={subpathIsUUID ? subpath : undefined} />;
}
