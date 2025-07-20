import { Metadata } from "next";
import { getWebPage } from "../_api";
import { AccountPageContent } from "./_components/AccountPageContent";

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
    title: webPage.profile.name + " | " + "My Account",
    description: webPage.profile.name + " | " + "Manage your account",
    openGraph: {
      title: webPage.profile.name + " | " + "My Account",
      description: webPage.profile.name + " | " + "Manage your account",
    },
  };
}

export default function AccountPage() {
  return <AccountPageContent />;
}
