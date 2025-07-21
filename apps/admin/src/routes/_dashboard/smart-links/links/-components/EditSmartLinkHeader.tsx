import { Button, useEditorContext, type SmartLink } from "@tribe-nest/frontend-shared";
import { Tooltip2 } from "@tribe-nest/frontend-shared";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon, Monitor, Smartphone, Save, Undo, Redo } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useEditor } from "@craftjs/core";
import { toast } from "sonner";

import { UpdateStylesDialog } from "@/routes/_dashboard/website/themes/-component/update-styles-dialog";
import { useUpdateSmartLink } from "@/hooks/mutations/useSmartLink";

export const EditSmartLinkHeader = ({
  smartLink,
  isMobile,
  setIsMobile,
}: {
  smartLink: SmartLink;
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
}) => {
  const navigate = useNavigate();
  const router = useRouter();
  const { themeSettings, setThemeSettings } = useEditorContext();
  const { query, canUndo, canRedo, actions } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const { currentProfileAuthorization } = useAuth();
  const { mutateAsync: updateSmartLink } = useUpdateSmartLink();

  if (!currentProfileAuthorization) {
    return null;
  }

  const handleSaveClick = async () => {
    const serializedNodes = query.getSerializedNodes();

    try {
      await updateSmartLink({
        smartLinkId: smartLink.id,
        profileId: currentProfileAuthorization.profile.id,
        themeSettings,
        path: smartLink.path,
        title: smartLink.title,
        content: JSON.stringify(serializedNodes),
      });
      toast.success("Smart link saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save smart link");
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 z-[100000] bg-background">
      <div className="flex items-center gap-2">
        <Tooltip2 text="Back">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (router.history.canGoBack()) {
                router.history.back();
              } else {
                navigate({ to: "/smart-links/links" });
              }
            }}
          >
            <ArrowLeftIcon className="w-4 h-4 text-foreground" />
          </Button>
        </Tooltip2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <UpdateStylesDialog theme={themeSettings} setTheme={setThemeSettings} />
          <Tooltip2 text="Undo">
            <Button size="icon" variant="outline" disabled={!canUndo} onClick={() => actions.history.undo()}>
              <Undo className="w-4 h-4 text-foreground" />
            </Button>
          </Tooltip2>
          <Tooltip2 text="Redo">
            <Button size="icon" variant="outline" disabled={!canRedo} onClick={() => actions.history.redo()}>
              <Redo className="w-4 h-4 text-foreground" />
            </Button>
          </Tooltip2>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip2 text="Desktop">
            <Button size="icon" variant={isMobile ? "link" : "outline"} onClick={() => setIsMobile(false)}>
              <Monitor className="w-4 h-4 text-foreground" />
            </Button>
          </Tooltip2>
          <Tooltip2 text="Mobile">
            <Button size="icon" variant={isMobile ? "outline" : "link"} onClick={() => setIsMobile(true)}>
              <Smartphone className="w-4 h-4 text-foreground" />
            </Button>
          </Tooltip2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip2 text="Save the website version">
          <Button onClick={handleSaveClick}>
            <Save className="w-4 h-4 text-foreground" />
          </Button>
        </Tooltip2>
      </div>
    </header>
  );
};
