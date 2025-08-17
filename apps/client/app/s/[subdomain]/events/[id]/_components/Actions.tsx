import { EditorButtonWithoutEditor, useEditorContext } from "@tribe-nest/frontend-shared";
import React from "react";

type Props = {
  totalPrice: number;
  canGoBack: boolean;
  handleBack: () => void;
  handleNext: () => void;
};

export function Actions({ totalPrice, canGoBack, handleBack, handleNext }: Props) {
  const { themeSettings } = useEditorContext();
  return (
    <div
      style={{
        backgroundColor: themeSettings.colors.background,
      }}
      className="absolute bottom-0 left-0 right-0 md:px-10 py-4 px-4"
    >
      <div
        className="p-4 border-1 mb-4"
        style={{
          borderColor: themeSettings.colors.primary + "40",
          backgroundColor: themeSettings.colors.background,
          borderRadius: `${themeSettings.cornerRadius}px`,
        }}
      >
        <div className="flex justify-between items-center">
          <span className="font-semibold" style={{ color: themeSettings.colors.text }}>
            Total
          </span>
          <span className="text-xl font-bold" style={{ color: themeSettings.colors.primary }}>
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="flex gap-2 justify-between">
        <EditorButtonWithoutEditor disabled={!canGoBack} variant="secondary" text="Back" onClick={handleBack} />
        <EditorButtonWithoutEditor text="Continue" onClick={handleNext} />
      </div>
    </div>
  );
}
