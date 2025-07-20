import { Metadata } from "next";
import { getWebPage } from "../_api";
import { CheckoutPageContent } from "./_components/checkout-page-content";

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
    title: webPage.profile.name + " | " + "Checkout",
    description: webPage.profile.name + " | " + "Checkout",
    icons: [{ rel: "icon", url: "/tribenest_icon.png" }],
    openGraph: {
      title: webPage.profile.name + " | " + "Checkout",
      description: webPage.profile.name + " | " + "Checkout",
    },
  };
}
export default async function Page() {
  return <CheckoutPageContent />;
}
