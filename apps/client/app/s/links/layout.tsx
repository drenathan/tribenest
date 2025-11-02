"use client";
import {
  AudioPlayerProvider,
  CartProvider,
  ContainerQueryProvider,
  EditorContextProvider,
  PublicAuthProvider,
  SmartLink,
  ThemeAudioPlayer,
  Toaster,
} from "@tribe-nest/frontend-shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ConfigProvider, useConfig } from "../[subdomain]/_contexts/config";

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
  const [smartLink, setSmartLink] = useState<SmartLink | null>(null);
  const params = useParams<{ subdomain: string; path: string }>();
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { httpClient, setHttpClientToken, rootDomain } = useConfig();

  useEffect(() => {
    const fetchWebPage = async () => {
      try {
        const { path } = params;
        const response = await httpClient!.get(`/public/smart-links?path=${path}`);

        const smartLink = response.data as SmartLink;
        if (smartLink) {
          setSmartLink(smartLink);
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

  if (!smartLink) {
    return <div>404</div>;
  }

  if (!smartLink) {
    return <div>404</div>;
  }

  const formatPath = (path: string) => {
    if (path.startsWith("/")) {
      return `${window.location.protocol}//${rootDomain}${path}`;
    }
    return path;
  };

  const trackEvent = (eventType: string, eventData: Record<string, unknown> = {}) => {
    const key = `tribe_nest_smart_${smartLink.path}_session_id`;
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
      sessionId = `${smartLink.path}_${Date.now()}`;
      sessionStorage.setItem(key, sessionId);
    }

    httpClient?.post(`/public/smart-links/track-event`, {
      path: smartLink.path,
      eventType,
      eventData: {
        ...eventData,
        sessionId,
      },
    });
  };

  return (
    <div
      ref={ref}
      className="h-screen w-full @container"
      style={{
        color: smartLink.themeSettings.colors.text,
      }}
    >
      <ContainerQueryProvider ref={ref}>
        <EditorContextProvider
          profile={smartLink.profile}
          isAdminView={false}
          httpClient={httpClient}
          themeSettings={smartLink.themeSettings}
          trackEvent={trackEvent}
          pages={[]}
          navigate={(path, options) => {
            if (options?.replace) {
              router.replace(formatPath(path));
            } else {
              router.push(formatPath(path));
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
                        "--normal-bg": smartLink.themeSettings.colors.background,
                        "--normal-text": smartLink.themeSettings.colors.text,
                        "--normal-border": smartLink.themeSettings.colors.primary,
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
