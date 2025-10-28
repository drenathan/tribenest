import { Metadata } from "next";
import { getBroadcast, getWebPage } from "../../_api";
import { BroadcastItemContent } from "../_components/BroadcastItemContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string; broadcastId: string }>;
}): Promise<Metadata> {
  const { subdomain, broadcastId } = await params;
  const webPage = await getWebPage({ subdomain, pathname: "/" });

  if (!webPage || !broadcastId) {
    return {
      title: "Tribe Nest",
      description: "The all in one platform for artists",
    };
  }

  const broadcast = await getBroadcast({ id: broadcastId, profileId: webPage.profile.id });

  return {
    title: webPage.profile.name + " | " + broadcast?.title,
    description: webPage.profile.name + " | " + broadcast?.title,
    openGraph: {
      title: webPage.profile.name + " | " + broadcast?.title,
      description: webPage.profile.name + " | " + broadcast?.title,
    },
  };
}

export default function AccountPage() {
  return <BroadcastItemContent />;
}
