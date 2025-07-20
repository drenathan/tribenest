import { Metadata } from "next";
import { getWebPage } from "../../_api";
import InternalPageRenderer from "../../_components/internal-page-renderer";
import { MembershipCheckoutContent } from "./_components/membership-checkout-content";

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
    title: webPage.profile.name + " | " + "Membership Checkout",
    description: webPage.profile.name + " | " + "Membership Checkout",
    icons: [{ rel: "icon", url: "/tribenest_icon.png" }],
    openGraph: {
      title: webPage.profile.name + " | " + "Membership Checkout",
      description: webPage.profile.name + " | " + "Membership Checkout",
    },
  };
}

export default async function Page() {
  return (
    <InternalPageRenderer>
      <MembershipCheckoutContent />
    </InternalPageRenderer>
  );
}
