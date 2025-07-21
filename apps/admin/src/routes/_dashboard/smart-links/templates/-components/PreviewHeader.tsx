import { Button, useEditorContext } from "@tribe-nest/frontend-shared";
import { Tooltip2 } from "@tribe-nest/frontend-shared";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, Monitor, Smartphone, Rocket } from "lucide-react";
import { useEditor } from "@craftjs/core";
import { useAuth } from "@/hooks/useAuth";

export const PreviewHeader = ({
  isMobile,
  setIsMobile,
}: {
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { query } = useEditor();
  const { currentProfileAuthorization } = useAuth();
  const { profile } = useEditorContext();

  if (!currentProfileAuthorization || !profile) {
    return null;
  }

  const handleActivateTheme = () => {
    console.log(query.getSerializedNodes());
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 z-[100000] bg-background">
      <div className="flex items-center gap-2">
        <Tooltip2 text="Back">
          <Button variant="outline" size="icon" onClick={() => navigate({ to: "/smart-links/templates" })}>
            <ArrowLeftIcon className="w-4 h-4 text-foreground" />
          </Button>
        </Tooltip2>
      </div>

      <div className="flex items-center gap-4">
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
        <Tooltip2 text="Create a new smart link from this template">
          <Button onClick={handleActivateTheme}>
            <Rocket /> Create Smart Link
          </Button>
        </Tooltip2>
      </div>
    </header>
  );
};
