// import { Metadata } from "next";

import { Metadata } from "next";
import { getWebPage } from "./_api";
import { PageRenderer } from "./_components/page-renderer";

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params;
  const webPage = await getWebPage({ subdomain, pathname: "/" });

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

export default async function SubdomainPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const webPage = await getWebPage({ subdomain, pathname: "/" });

  if (!webPage) {
    return <div>404</div>;
  }

  return <PageRenderer webPage={webPage} />;
}
