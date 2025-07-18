"use client";
import {
  AudioPlayerProvider,
  CartProvider,
  ContainerQueryProvider,
  EditorContextProvider,
  PublicAuthProvider,
  ThemeAudioPlayer,
  Toaster,
  websiteThemes,
} from "@tribe-nest/frontend-shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WebPage } from "./_api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ConfigProvider, useConfig } from "./_contexts/config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

export default function SubdomainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider>
      <Content>{children}</Content>
    </ConfigProvider>
  );
}

const Content = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [webPage, setWebPage] = useState<WebPage | null>(null);
  const params = useParams<{ subdomain: string; path: string }>();
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { httpClient, setHttpClientToken } = useConfig();

  useEffect(() => {
    const fetchWebPage = async () => {
      try {
        const { subdomain, path } = params;
        const response = await httpClient!.get(
          `/public/websites?subdomain=${subdomain}&pathname=${path ? `/${path}` : "/"}`,
        );

        const webPage = response.data as WebPage;
        if (webPage) {
          setWebPage(webPage);
        }
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    fetchWebPage();
  }, [params, httpClient]);

  if (!httpClient) {
    return null;
  }
  if (isLoading) {
    return null;
  }

  if (!webPage) {
    return <div>404</div>;
  }

  const theme = websiteThemes.find((theme) => theme.slug === webPage.themeName);

  if (!theme) {
    return <div>404</div>;
  }

  return (
    <div
      ref={ref}
      className="h-screen w-full @container"
      style={{
        color: theme.themeSettings.colors.text,
      }}
    >
      <ContainerQueryProvider ref={ref}>
        <EditorContextProvider
          profile={webPage.profile}
          isAdminView={false}
          httpClient={httpClient}
          themeSettings={webPage.themeSettings}
          themeName={webPage.themeName}
          pages={theme.pages}
          navigate={(path) => {
            router.push(`${path}`);
          }}
        >
          <QueryClientProvider client={queryClient}>
            <PublicAuthProvider httpClient={httpClient} setHttpClientToken={setHttpClientToken}>
              <CartProvider>
                <AudioPlayerProvider>
                  {children}
                  <Toaster
                    closeButton
                    position="top-center"
                    style={
                      {
                        "--normal-bg": theme.themeSettings.colors.background,
                        "--normal-text": theme.themeSettings.colors.text,
                        "--normal-border": theme.themeSettings.colors.primary,
                      } as React.CSSProperties
                    }
                  />
                  <ThemeAudioPlayer />
                </AudioPlayerProvider>
              </CartProvider>
            </PublicAuthProvider>
          </QueryClientProvider>
        </EditorContextProvider>
      </ContainerQueryProvider>
    </div>
  );
};
