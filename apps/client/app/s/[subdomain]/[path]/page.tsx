import { Metadata } from "next";
import { getWebPage } from "../_api";
import { PageRenderer } from "../_components/page-renderer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string; path: string }>;
}): Promise<Metadata> {
  const { subdomain, path } = await params;
  const webPage = await getWebPage({ subdomain, pathname: `/${path}` });

  if (!webPage) {
    return {
      title: "Tribe Nest",
      description: "The all in one platform for artists",
    };
  }

  return {
    title: webPage.profile.name + " | " + webPage.page.title,
    description: webPage.page.description,
    openGraph: {
      title: webPage.page.title,
      description: webPage.page.description,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ subdomain: string; path: string }> }) {
  const { subdomain, path } = await params;
  const webPage = await getWebPage({ subdomain, pathname: `/${path}` });

  if (!webPage) {
    return <div>404</div>;
  }

  return <PageRenderer webPage={webPage} />;
}
