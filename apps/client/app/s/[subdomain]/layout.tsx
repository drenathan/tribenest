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
import { InstallPWABanner } from "../../_components/InstallPWA";
import { PWAHead } from "../../_components/PWAHead";

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

  const trackEvent = (eventType: string, eventData: Record<string, unknown> = {}) => {
    const key = `tribe_nest_website_${params.subdomain}_session_id`;
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
      sessionId = `${params.subdomain}_${Date.now()}`;
      sessionStorage.setItem(key, sessionId);
    }

    httpClient?.post(`/public/websites/track-event`, {
      subdomain: params.subdomain,
      eventType,
      eventData: {
        ...eventData,
        sessionId,
      },
    });
  };

  return (
    <>
      <PWAHead
        subdomain={params.subdomain}
        appName={webPage.profile?.name ? `${webPage.profile.name} - TribeNest` : undefined}
        description={webPage.page?.description || undefined}
        themeColor={theme.themeSettings.colors.primary}
        backgroundColor={theme.themeSettings.colors.background}
      />
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
            trackEvent={trackEvent}
            navigate={(path, options) => {
              if (options?.replace) {
                router.replace(path);
              } else {
                router.push(path);
              }
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
                    <InstallPWABanner />
                  </AudioPlayerProvider>
                </CartProvider>
              </PublicAuthProvider>
            </QueryClientProvider>
          </EditorContextProvider>
        </ContainerQueryProvider>
      </div>
    </>
  );
};
