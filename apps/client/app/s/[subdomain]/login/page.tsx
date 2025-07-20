import { Metadata } from "next";
import { getWebPage } from "../_api";

import { LoginContent } from "./_components/login-content";

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
    title: webPage.profile.name + " | " + "Login",
    description: webPage.profile.name + " | " + "Login",
    icons: [{ rel: "icon", url: "/tribenest_icon.png" }],
    openGraph: {
      title: webPage.profile.name + " | " + "Login",
      description: webPage.profile.name + " | " + "Login",
    },
  };
}

export default async function Page() {
  return <LoginContent />;
}
