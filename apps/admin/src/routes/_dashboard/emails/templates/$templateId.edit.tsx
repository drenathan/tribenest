import { Editor, Element, Frame } from "@craftjs/core";
import { createFileRoute } from "@tanstack/react-router";
import {
  defaultSmartLinkThemeSettings,
  EditorContextProvider,
  EmailContainer,
  EmailRenderNode,
  EmailViewport,
  type ApiError,
} from "@tribe-nest/frontend-shared";
import { useState } from "react";
import { EditEmailHeader } from "./-components/EditEmailHeader";
import selectors from "@tribe-nest/email-selectors";
import { useAuth } from "@/hooks/useAuth";
import httpClient from "@/services/httpClient";
import { useGetEmailTemplate } from "@/hooks/queries/useEmails";
import { useUpdateEmailTemplate } from "@/hooks/mutations/useEmails";
import { toast } from "sonner";
import { isEmpty } from "lodash";

export const Route = createFileRoute("/_dashboard/emails/templates/$templateId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isMobile, setIsMobile] = useState(false);
  const { currentProfileAuthorization } = useAuth();
  const { templateId } = Route.useParams();
  const { data: template } = useGetEmailTemplate(templateId, currentProfileAuthorization?.profileId);
  const { mutateAsync } = useUpdateEmailTemplate();

  if (!currentProfileAuthorization || !template) {
    return null;
  }

  const { profile } = currentProfileAuthorization;

  const emptyContent = isEmpty(template.content);

  const handleUpdateTemplate = async (content: string) => {
    try {
      await mutateAsync({
        emailTemplateId: templateId,
        content,
        title: template.title,
        profileId: profile.id,
      });
      toast.success("Template updated successfully");
    } catch (error) {
      const message = (error as ApiError)?.response?.data?.message;
      toast.error(message || "Failed to update template");
      console.error(error);
    }
  };

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
          <EditEmailHeader isMobile={isMobile} setIsMobile={setIsMobile} onSaveTemplate={handleUpdateTemplate} />
          <EmailViewport isMobile={isMobile}>
            {emptyContent ? (
              <Frame>
                <Element is={EmailContainer} canvas></Element>
              </Frame>
            ) : (
              <Frame data={template.content}></Frame>
            )}
          </EmailViewport>
        </Editor>
      </EditorContextProvider>
    </div>
  );
}
