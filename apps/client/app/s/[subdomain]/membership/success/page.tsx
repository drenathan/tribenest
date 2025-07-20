import { Metadata } from "next";
import { getWebPage } from "../../_api";
import InternalPageRenderer from "../../_components/internal-page-renderer";
import { MembershipSuccessContent } from "./_components/membership-success-content";
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
    title: webPage.profile.name + " | " + "Membership Success",
    description: webPage.profile.name + " | " + "Membership Success",
    icons: [{ rel: "icon", url: "/tribenest_icon.png" }],
    openGraph: {
      title: webPage.profile.name + " | " + "Membership Success",
      description: webPage.profile.name + " | " + "Membership Success",
    },
  };
}

export default async function Page() {
  return (
    <InternalPageRenderer>
      <MembershipSuccessContent />
    </InternalPageRenderer>
  );
}
