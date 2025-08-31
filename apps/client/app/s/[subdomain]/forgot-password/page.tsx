import { Metadata } from "next";
import { getWebPage } from "../_api";
import InternalPageRenderer from "../_components/internal-page-renderer";
import { ForgotPasswordContent } from "./_components/forgot-password-content";

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
    title: webPage.profile.name + " | " + "Forgot Password",
    description: webPage.profile.name + " | " + "Forgot Password",
    icons: [{ rel: "icon", url: "/tribenest_icon.png" }],
    openGraph: {
      title: webPage.profile.name + " | " + "Forgot Password",
      description: webPage.profile.name + " | " + "Forgot Password",
    },
  };
}

export default async function Page() {
  return (
    <InternalPageRenderer pagePathname="/forgot-password" pageTitle="Forgot Password">
      <ForgotPasswordContent />
    </InternalPageRenderer>
  );
}
