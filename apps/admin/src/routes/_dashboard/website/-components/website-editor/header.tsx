import { Button, useEditorContext } from "@tribe-nest/frontend-shared";
import { Tooltip2 } from "@tribe-nest/frontend-shared";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, ChevronDown, Monitor, Smartphone, Rocket, Save, Undo, Redo } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@tribe-nest/frontend-shared";
import { cn } from "@tribe-nest/frontend-shared";
import { useAuth } from "@/hooks/useAuth";
import type { WebsiteVersion, WebsiteVersionPage } from "@/types/website";
import { useSaveWebsiteVersion } from "@/hooks/mutations/useWebsite";
import { useEditor } from "@craftjs/core";
import { toast } from "sonner";
import { UpdateStylesDialog } from "../../themes/-component/update-styles-dialog";

export const WebsiteEditorHeader = ({
  currentPage,
  setCurrentPage,
  websiteVersion,
  isMobile,
  setIsMobile,
}: {
  currentPage?: WebsiteVersionPage;
  setCurrentPage: (page: WebsiteVersionPage) => void;
  websiteVersion: WebsiteVersion;
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { themeSettings, setThemeSettings } = useEditorContext();
  const { query, canUndo, canRedo, actions } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const { currentProfileAuthorization } = useAuth();
  const { mutateAsync: saveWebsiteVersion } = useSaveWebsiteVersion();

  if (!currentProfileAuthorization) {
    return null;
  }

  const handleActivateClick = async () => {};

  const handleSaveClick = async () => {
    const serializedNodes = query.getSerializedNodes();
    const updatedPages = websiteVersion.pages.map((page) => {
      return {
        ...page,
        content: JSON.stringify(page.pathname === currentPage?.pathname ? serializedNodes : page.content),
      };
    });

    try {
      await saveWebsiteVersion({
        pages: updatedPages,
        websiteVersionId: websiteVersion.id,
        profileId: currentProfileAuthorization.profile.id,
        themeSettings,
      });
      toast.success("Website version saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save website version");
    }
  };

  const handlePageChange = (page: WebsiteVersionPage) => {
    setCurrentPage(page);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 z-[100000] bg-background">
      <div className="flex items-center gap-2">
        <Tooltip2 text="Back">
          <Button variant="outline" size="icon" onClick={() => navigate({ to: "/website/home" })}>
            <ArrowLeftIcon className="w-4 h-4 text-foreground" />
          </Button>
        </Tooltip2>
      </div>
      {currentPage && (
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 text-foreground cursor-pointer">
                {currentPage.title} <ChevronDown className="w-4 h-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56 rounded-lg space-y-1 py-2"
              side={"bottom"}
              align="center"
              sideOffset={4}
            >
              {websiteVersion?.pages.map((page) => (
                <DropdownMenuItem
                  onClick={() => handlePageChange(page)}
                  className={cn({ "bg-primary": page.pathname === currentPage.pathname })}
                  key={page.pathname}
                >
                  {page.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
      )}
      <div className="flex items-center gap-2">
        <Tooltip2 text="Save the website version">
          <Button onClick={handleSaveClick}>
            <Save className="w-4 h-4 text-foreground" />
          </Button>
        </Tooltip2>
        {!websiteVersion.isActive && (
          <div className="flex items-center gap-2">
            <Tooltip2 text="Publish the website version">
              <Button onClick={handleActivateClick}>
                <Rocket /> Publish
              </Button>
            </Tooltip2>
          </div>
        )}
      </div>
    </header>
  );
};
