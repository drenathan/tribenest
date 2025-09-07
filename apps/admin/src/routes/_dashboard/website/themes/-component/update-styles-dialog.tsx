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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  FontFamily,
} from "@tribe-nest/frontend-shared";
import { Settings } from "lucide-react";
import { useState } from "react";

// Curated list of 20 Google fonts perfect for musician/artist websites
const FONT_OPTIONS = [
  { label: "Inter", value: FontFamily.Inter },
  { label: "Poppins", value: FontFamily.Poppins },
  { label: "Montserrat", value: FontFamily.Montserrat },
  { label: "Open Sans", value: FontFamily.OpenSans },
  { label: "Roboto", value: FontFamily.Roboto },
  { label: "Lato", value: FontFamily.Lato },
  { label: "Source Sans Pro", value: FontFamily.SourceSansPro },
  { label: "Nunito", value: FontFamily.Nunito },
  { label: "Raleway", value: FontFamily.Raleway },
  { label: "Ubuntu", value: FontFamily.Ubuntu },
  { label: "Playfair Display", value: FontFamily.PlayfairDisplay },
  { label: "Merriweather", value: FontFamily.Merriweather },
  { label: "Lora", value: FontFamily.Lora },
  { label: "Crimson Text", value: FontFamily.CrimsonText },
  { label: "Libre Baskerville", value: FontFamily.LibreBaskerville },
  { label: "Oswald", value: FontFamily.Oswald },
  { label: "Bebas Neue", value: FontFamily.BebasNeue },
  { label: "Fjalla One", value: FontFamily.FjallaOne },
  { label: "Anton", value: FontFamily.Anton },
  { label: "Righteous", value: FontFamily.Righteous },
];

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
            onChange={(value) => {
              setTheme({ ...theme, colors: { ...theme.colors, textPrimary: value } });
            }}
          />
          <ToolbarTextInput
            type="text"
            label="Corner Radius"
            value={theme.cornerRadius}
            onChange={(value) => {
              setTheme({ ...theme, cornerRadius: value });
            }}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Font Family</label>
            <Select
              value={theme.fontFamily}
              onValueChange={(value) => {
                setTheme({ ...theme, fontFamily: value });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
