import { Metadata } from "next";
import { getWebPage } from "../../_api";
import EventPageContent from "./_components/EventPageContent";

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
    title: webPage.profile.name + " | " + "Event",
    description: webPage.profile.name + " | " + "Event",
    openGraph: {
      title: webPage.profile.name + " | " + "Event",
      description: webPage.profile.name + " | " + "Event",
    },
  };
}
export default function EventPage() {
  return <EventPageContent />;
}
