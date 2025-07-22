import { Editor, Element, Frame } from "@craftjs/core";
import { createFileRoute } from "@tanstack/react-router";
import {
  defaultSmartLinkThemeSettings,
  EditorContextProvider,
  EmailContainer,
  EmailRenderNode,
  EmailViewport,
} from "@tribe-nest/frontend-shared";
import { useState } from "react";
import { EditEmailHeader } from "./-components/EditEmailHeader";
import selectors from "@tribe-nest/email-selectors";
import { useAuth } from "@/hooks/useAuth";
import httpClient from "@/services/httpClient";

export const Route = createFileRoute("/_dashboard/email/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isMobile, setIsMobile] = useState(false);
  const { currentProfileAuthorization } = useAuth();

  if (!currentProfileAuthorization) {
    return null;
  }

  const { profile } = currentProfileAuthorization;

  return (
    <div className="h-screen">
      <EditorContextProvider
        profile={profile}
        isAdminView={true}
        httpClient={httpClient}
        themeSettings={defaultSmartLinkThemeSettings}
        navigate={() => {}}
        pages={[]}
      >
        <Editor enabled={true} onRender={EmailRenderNode} resolver={selectors}>
          <EditEmailHeader isMobile={isMobile} setIsMobile={setIsMobile} />
          <EmailViewport isMobile={isMobile}>
            <Frame>
              <Element is={EmailContainer} canvas></Element>
            </Frame>
          </EmailViewport>
        </Editor>
      </EditorContextProvider>
    </div>
  );
}
