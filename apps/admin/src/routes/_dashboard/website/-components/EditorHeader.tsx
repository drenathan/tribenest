import { Button } from "@tribe-nest/frontend-shared";

import { Tooltip2 } from "@tribe-nest/frontend-shared";

import type { EditorTheme, ThemeConfig, ThemePage } from "@tribe-nest/frontend-shared";
import { useNavigate } from "@tanstack/react-router";
import { useEditor } from "@craftjs/core";
import { ArrowLeftIcon, Undo, Redo, ChevronDown, Monitor, Smartphone, SaveIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@tribe-nest/frontend-shared";
import { cn } from "@tribe-nest/frontend-shared";
import { UpdateStylesDialog } from "../themes/-component/update-styles-dialog";

export const EditorHeader = ({
  currentPage,
  setCurrentPage,
  theme,
  isMobile,
  setIsMobile,
  editorTheme,
  setEditorTheme,
}: {
  currentPage?: ThemePage;
  setCurrentPage: (page: ThemePage) => void;
  theme?: ThemeConfig;
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
  editorTheme: EditorTheme;
  setEditorTheme: React.Dispatch<React.SetStateAction<EditorTheme>>;
}) => {
  const { enabled, canUndo, canRedo, actions } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const navigate = useNavigate();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 z-[100000] bg-background">
      <div className="flex items-center gap-2">
        <Tooltip2 text="Back">
          <Button variant="outline" size="icon" onClick={() => navigate({ to: "/website/themes" })}>
            <ArrowLeftIcon className="w-4 h-4 text-foreground" />
          </Button>
        </Tooltip2>
      </div>
      {currentPage && (
        <div className="flex items-center gap-4">
          {enabled && (
            <div className="flex items-center gap-2">
              <UpdateStylesDialog theme={editorTheme} setTheme={setEditorTheme} />
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
          )}
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
              {theme?.pages.map((page) => (
                <DropdownMenuItem
                  onClick={() => setCurrentPage(page)}
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
        <Tooltip2 text="Save">
          <Button size="icon">
            <SaveIcon className="w-4 h-4 text-foreground" />
          </Button>
        </Tooltip2>
      </div>
    </header>
  );
};
