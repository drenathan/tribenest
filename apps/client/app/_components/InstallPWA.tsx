"use client";

import { EditorButtonWithoutEditor, FontFamily, useEditorContext } from "@tribe-nest/frontend-shared";
import { usePWA } from "../../lib/hooks/usePWA";
import { useState } from "react";
import { X } from "lucide-react";

export function InstallPWABanner() {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { themeSettings } = useEditorContext();

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installPWA();
    setIsInstalling(false);

    if (!success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-100`}
      style={{
        fontFamily: themeSettings?.fontFamily || FontFamily.Inter,
      }}
    >
      <div
        className="border rounded-lg shadow-lg p-3 max-w-sm"
        style={{
          backgroundColor: themeSettings?.colors?.background || "#ffffff",
          borderColor: themeSettings?.colors?.text || "#e5e7eb",
        }}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-4 text-xl leading-none transition-colors cursor-pointer"
          style={{ color: themeSettings?.colors?.text || "#9ca3af" }}
        >
          <X />
        </button>
        <div className="pr-6">
          <h4 className="font-medium mb-1" style={{ color: themeSettings?.colors?.text }}>
            Install App
          </h4>
          <p className="text-sm mb-3" style={{ color: themeSettings?.colors?.text }}>
            Get quick access from your home screen
          </p>
          <EditorButtonWithoutEditor
            onClick={handleInstall}
            disabled={isInstalling}
            text={isInstalling ? "Installing..." : "Install"}
          />
        </div>
      </div>
    </div>
  );
}
