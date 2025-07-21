import { useAuth } from "@/hooks/useAuth";
import httpClient, { publicHttpClient, setPublicHttpClientToken } from "@/services/httpClient";
import { Editor, Frame } from "@craftjs/core";
import { useState } from "react";
import {
  AudioPlayerProvider,
  CartProvider,
  EditorContextProvider,
  editorResolver,
  PublicAuthProvider,
  RenderNode,
  smartLinkTemplates,
  ThemeAudioPlayer,
  Viewport,
} from "@tribe-nest/frontend-shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PreviewHeader } from "./-components/PreviewHeader";

export const Route = createFileRoute("/_dashboard/smart-links/templates/$slug/preview")({
  component: RouteComponent,
});

const queryClient = new QueryClient();

function RouteComponent() {
  const { slug } = Route.useParams();
  const template = smartLinkTemplates.find((template) => template.slug === slug);
  const { currentProfileAuthorization } = useAuth();
  const [isMobile, setIsMobile] = useState(true);

  if (!template || !currentProfileAuthorization) {
    return null;
  }

  return (
    <div className="h-screen">
      <EditorContextProvider
        profile={currentProfileAuthorization.profile}
        isAdminView={true}
        httpClient={httpClient}
        themeSettings={template.themeSettings}
        navigate={() => {}}
        pages={[]}
      >
        <QueryClientProvider client={queryClient}>
          <PublicAuthProvider httpClient={publicHttpClient} setHttpClientToken={setPublicHttpClientToken}>
            <CartProvider>
              <AudioPlayerProvider>
                <Editor
                  enabled={false}
                  resolver={{ ...editorResolver, page: template.Component, ...template.editorResolver }}
                  onRender={RenderNode}
                >
                  <PreviewHeader isMobile={isMobile} setIsMobile={setIsMobile} template={template.slug} />
                  <Viewport isMobile={isMobile}>
                    <Frame>
                      <template.Component profile={currentProfileAuthorization.profile} />
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
