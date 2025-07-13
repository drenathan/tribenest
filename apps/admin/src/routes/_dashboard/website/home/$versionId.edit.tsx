import { useGetWebsiteVersion } from "@/hooks/queries/useWebsite";
import { useAuth } from "@/hooks/useAuth";
import { publicHttpClient, setPublicHttpClientToken } from "@/services/httpClient";
import type { WebsiteVersionPage } from "@/types/website";
import { Editor, Frame } from "@craftjs/core";
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
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WebsiteEditorHeader } from "../-components/website-editor/header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

export const Route = createFileRoute("/_dashboard/website/home/$versionId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { versionId } = Route.useParams();
  const { currentProfileAuthorization } = useAuth();
  const { data: websiteVersion } = useGetWebsiteVersion(versionId, currentProfileAuthorization?.profile.id);
  const [currentPage, setCurrentPage] = useState<WebsiteVersionPage | undefined>();
  const [isMobile, setIsMobile] = useState(false);
  const theme = websiteThemes.find((theme) => theme.slug === websiteVersion?.themeName);
  const themePage = theme?.pages.find((page) => page.pathname === currentPage?.pathname);

  useEffect(() => {
    if (websiteVersion) {
      setCurrentPage(websiteVersion.pages.find((page) => page.pathname === "/"));
    }
  }, [websiteVersion]);

  if (!websiteVersion || !currentProfileAuthorization || !currentPage || !themePage) {
    return null;
  }

  return (
    <div className="h-screen" key={currentPage?.pathname}>
      <EditorContextProvider
        pages={websiteVersion.pages as unknown as ThemePage[]}
        profile={currentProfileAuthorization.profile}
        isAdminView={false}
        httpClient={publicHttpClient}
        themeSettings={websiteVersion.themeSettings}
        navigate={() => {}}
      >
        <QueryClientProvider client={queryClient}>
          <PublicAuthProvider httpClient={publicHttpClient} setHttpClientToken={setPublicHttpClientToken}>
            <CartProvider>
              <AudioPlayerProvider>
                <Editor
                  enabled={true}
                  resolver={{ ...editorResolver, page: themePage.Component, ...theme?.editorResolver }}
                  onRender={RenderNode}
                >
                  <WebsiteEditorHeader
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    isMobile={isMobile}
                    setIsMobile={setIsMobile}
                    websiteVersion={websiteVersion}
                  />
                  <Viewport isMobile={isMobile}>
                    <Frame data={currentPage.content}></Frame>
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
