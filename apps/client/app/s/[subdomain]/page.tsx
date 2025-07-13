// import { Metadata } from "next";

import { getWebPage } from "./_api";
import { PageRenderer } from "./_components/page-renderer";

// export async function generateMetadata({
//     params
//   }: {
//     params: Promise<{ subdomain: string }>;
//   }): Promise<Metadata> {
//     const { subdomain } = await params;
//     const subdomainData = await getSubdomainData(subdomain);

//     if (!subdomainData) {
//       return {
//         title: rootDomain
//       };
//     }

//     return {
//       title: `${subdomain}.${rootDomain}`,
//       description: `Subdomain page for ${subdomain}.${rootDomain}`
//     };
//   }

export default async function SubdomainPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const webPage = await getWebPage({ subdomain, pathname: "/" });

  if (!webPage) {
    return <div>404</div>;
  }

  return <PageRenderer webPage={webPage} />;
}
