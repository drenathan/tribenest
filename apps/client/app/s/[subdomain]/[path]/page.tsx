import { getWebPage } from "../_api";
import { PageRenderer } from "../_components/page-renderer";

export default async function Page({ params }: { params: Promise<{ subdomain: string; path: string }> }) {
  const { subdomain, path } = await params;
  const webPage = await getWebPage({ subdomain, pathname: `/${path}` });

  if (!webPage) {
    return <div>404</div>;
  }

  return <PageRenderer webPage={webPage} />;
}
