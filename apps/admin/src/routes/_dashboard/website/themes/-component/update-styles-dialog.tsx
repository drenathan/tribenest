import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Tooltip2,
  type EditorTheme,
  ToolbarTextInput,
} from "@tribe-nest/frontend-shared";
import { Settings } from "lucide-react";
import { useState } from "react";

export function UpdateStylesDialog({
  theme,
  setTheme,
}: {
  theme: EditorTheme;
  setTheme: React.Dispatch<React.SetStateAction<EditorTheme>>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div>
          <Tooltip2 text="Styles Settings">
            <Button size="icon" variant="outline">
              <Settings className="w-4 h-4 text-foreground" />
            </Button>
          </Tooltip2>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Styles</DialogTitle>
          <DialogDescription>Make changes to your styles here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ToolbarTextInput
            label="Primary Color"
            type="color"
            value={theme.colors.primary}
            onChange={(value) => {
              setTheme({ ...theme, colors: { ...theme.colors, primary: value } });
            }}
          />
          <ToolbarTextInput
            label="Background Color"
            type="color"
            value={theme.colors.background}
            onChange={(value) => {
              setTheme({ ...theme, colors: { ...theme.colors, background: value } });
            }}
          />
          <ToolbarTextInput
            label="Text Color"
            type="color"
            value={theme.colors.text}
            onChange={(value) => {
              setTheme({ ...theme, colors: { ...theme.colors, text: value } });
            }}
          />
          <ToolbarTextInput
            label="Text Color over primary"
            type="color"
            value={theme.colors.textPrimary}
            onChange={() => {}}
          />
          <ToolbarTextInput
            type="text"
            label="Corner Radius"
            value={theme.cornerRadius}
            onChange={(value) => {
              setTheme({ ...theme, cornerRadius: value });
            }}
          />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
