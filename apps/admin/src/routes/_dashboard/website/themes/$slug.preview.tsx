import { createFileRoute } from "@tanstack/react-router";
import { PreviewHeader } from "./-component/PreviewHeader";
import { useAuth } from "@/hooks/useAuth";
import { publicHttpClient, setPublicHttpClientToken } from "@/services/httpClient";
import { Editor, Frame } from "@craftjs/core";
import { useState } from "react";
import {
  AudioPlayerProvider,
  CartProvider,
  EditorContextProvider,
  editorResolver,
  PublicAuthProvider,
  RenderNode,
  ThemeAudioPlayer,
  Viewport,
  websiteThemes,
  type ThemePage,
} from "@tribe-nest/frontend-shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const Route = createFileRoute("/_dashboard/website/themes/$slug/preview")({
  component: RouteComponent,
});

const queryClient = new QueryClient();

function RouteComponent() {
  const { slug } = Route.useParams();
  const theme = websiteThemes.find((theme) => theme.slug === slug);
  const { currentProfileAuthorization } = useAuth();
  const [currentPage, setCurrentPage] = useState<ThemePage | undefined>(theme?.pages[0]);
  const [isMobile, setIsMobile] = useState(false);

  if (!theme || !currentProfileAuthorization || !currentPage) {
    return null;
  }

  return (
    <div className="h-screen">
      <EditorContextProvider
        profile={currentProfileAuthorization.profile}
        isAdminView={true}
        httpClient={publicHttpClient}
        themeSettings={theme.themeSettings}
        navigate={() => {}}
        pages={theme.pages}
      >
        <QueryClientProvider client={queryClient}>
          <PublicAuthProvider httpClient={publicHttpClient} setHttpClientToken={setPublicHttpClientToken}>
            <CartProvider>
              <AudioPlayerProvider>
                <Editor
                  key={currentPage?.pathname}
                  enabled={false}
                  resolver={{ ...editorResolver, page: currentPage.Component, ...theme.editorResolver }}
                  onRender={RenderNode}
                >
                  <PreviewHeader
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    isMobile={isMobile}
                    setIsMobile={setIsMobile}
                    theme={theme}
                  />
                  <Viewport isMobile={isMobile}>
                    <Frame>
                      <currentPage.Component key={currentPage.pathname} profile={currentProfileAuthorization.profile} />
                    </Frame>
                  </Viewport>
                </Editor>
                <ThemeAudioPlayer />
              </AudioPlayerProvider>
            </CartProvider>
          </PublicAuthProvider>
        </QueryClientProvider>
      </EditorContextProvider>
    </div>
  );
}
