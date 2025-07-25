import { useAuth } from "@/hooks/useAuth";
import httpClient, { publicHttpClient, setPublicHttpClientToken } from "@/services/httpClient";
import { Editor, Frame, Element } from "@craftjs/core";
import {
  AudioPlayerProvider,
  CartProvider,
  Container,
  EditorContextProvider,
  editorResolver,
  PublicAuthProvider,
  RenderNode,
  smartLinkTemplates,
  ThemeAudioPlayer,
  Viewport,
} from "@tribe-nest/frontend-shared";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetSmartLink } from "@/hooks/queries/useSmartLinks";
import { EditSmartLinkHeader } from "./-components/EditSmartLinkHeader";
import { isEmpty } from "lodash";
const queryClient = new QueryClient();

export const Route = createFileRoute("/_dashboard/smart-links/links/$smartLinkId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { smartLinkId } = Route.useParams();
  const { currentProfileAuthorization } = useAuth();
  const { data: smartLink } = useGetSmartLink(smartLinkId, currentProfileAuthorization?.profile.id);
  const [isMobile, setIsMobile] = useState(true);
  const Template = smartLink?.template
    ? smartLinkTemplates.find((template) => template.slug === smartLink.template)?.Component
    : null;

  if (!smartLink || !currentProfileAuthorization) {
    return null;
  }

  const isEmptyContent = isEmpty(smartLink.content);
  return (
    <div className="h-screen">
      <EditorContextProvider
        pages={[]}
        profile={smartLink.profile}
        isAdminView={false}
        httpClient={httpClient}
        themeSettings={smartLink.themeSettings}
        navigate={() => {}}
      >
        <QueryClientProvider client={queryClient}>
          <PublicAuthProvider httpClient={publicHttpClient} setHttpClientToken={setPublicHttpClientToken}>
            <CartProvider>
              <AudioPlayerProvider>
                <Editor
                  enabled={true}
                  resolver={{ ...editorResolver, ...(Template ? { page: Template } : {}) }}
                  onRender={RenderNode}
                >
                  <EditSmartLinkHeader smartLink={smartLink} isMobile={isMobile} setIsMobile={setIsMobile} />
                  <Viewport isMobile={isMobile}>
                    <Frame data={!isEmptyContent ? smartLink.content : undefined}>
                      {isEmptyContent && (
                        <Element
                          canvas
                          is={Container}
                          height="auto"
                          id="page-container"
                          width="100%"
                          alignItems="center"
                          paddingHorizontal="10"
                          paddingVertical="10"
                          custom={{ displayName: "Page", preventDelete: true }}
                          className="min-h-full"
                        ></Element>
                      )}
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
