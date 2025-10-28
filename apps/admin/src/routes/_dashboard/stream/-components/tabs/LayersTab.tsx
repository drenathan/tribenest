import { COLORS, FONT_OPTIONS } from "@/services/contants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  FontFamily,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tribe-nest/frontend-shared";
import { useState } from "react";
import { ChromePicker } from "react-color";
import { Logos } from "./Logos";
import { Backgrounds } from "./Backgrounds";
import { Overlays } from "./Overlays";
import { useParticipantStore } from "../store";

function LayersTab() {
  const { localTemplate, setLocalTemplate } = useParticipantStore();
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  if (!localTemplate) return null;

  const handleChangeFontFamily = (fontFamily: FontFamily) => {
    setLocalTemplate({
      ...localTemplate,
      config: { ...localTemplate.config, fontFamily },
    });
  };

  const handleChangePrimaryColor = (color: string) => {
    setLocalTemplate({
      ...localTemplate,
      config: { ...localTemplate.config, primaryColor: color },
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <label className="font-medium text-foreground">Font</label>
        <Select value={localTemplate?.config.fontFamily} onValueChange={handleChangeFontFamily}>
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
      <div className="flex flex-col gap-2 mt-6">
        <label className="font-medium text-foreground">Primary Color</label>
        <div onClick={() => setIsColorPickerOpen(true)} className="relative">
          {isColorPickerOpen ? (
            <div
              className="absolute"
              style={{
                zIndex: 99999,
                top: "calc(100% + 10px)",
                left: "-5%",
              }}
            >
              <div
                className="fixed top-0 left-0 w-full h-full cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsColorPickerOpen(false);
                }}
              ></div>
              <ChromePicker
                color={localTemplate?.config.primaryColor ?? COLORS.primary}
                onChange={(color) => {
                  handleChangePrimaryColor(color.hex);
                }}
              />
            </div>
          ) : null}
          <Input
            value={localTemplate?.config.primaryColor ?? COLORS.primary}
            onChange={(e) => handleChangePrimaryColor(e.target.value)}
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["logo"]} className="mt-6">
        <AccordionItem value="logo" className="border-b-0">
          <AccordionTrigger className="hover:no-underline">Logo</AccordionTrigger>
          <AccordionContent>
            <Logos />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="background" className="border-b-0">
          <AccordionTrigger className="hover:no-underline">Background</AccordionTrigger>
          <AccordionContent>
            <Backgrounds />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="overlays" className="border-b-0">
          <AccordionTrigger className="hover:no-underline">Overlays</AccordionTrigger>
          <AccordionContent>
            <Overlays />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default LayersTab;
