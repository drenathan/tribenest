import { Metadata } from "next";
import { getWebPage } from "../_api";
import { LiveBroadcastsContent } from "./_components/LiveBroadcastsContent";

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
    title: webPage.profile.name + " | " + "Live Broadcasts",
    description: webPage.profile.name + " | " + "Live Broadcasts",
    openGraph: {
      title: webPage.profile.name + " | " + "Live Broadcasts",
      description: webPage.profile.name + " | " + "Live Broadcasts",
    },
  };
}

export default function AccountPage() {
  return <LiveBroadcastsContent />;
}
