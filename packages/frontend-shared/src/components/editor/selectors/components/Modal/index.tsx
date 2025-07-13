"use client";
import React from "react";
import { X } from "lucide-react";
import { useEditorContext } from "../../../context";
import { alphaToHexCode, cn } from "../../../../../lib/utils";
import { type UserComponent } from "@craftjs/core";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
}

export const EditorModal: UserComponent<ModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  footer,
  size = "md",
  closeOnOverlayClick = true,
}) => {
  const { themeSettings } = useEditorContext();

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      className={cn("fixed inset-0 z-1000 flex items-center justify-center")}
      style={{
        backgroundColor: `rgba(0, 0, 0, 0.5)`,
      }}
      onClick={handleOverlayClick}
    >
      <div
        className={cn("relative w-full mx-4 rounded-lg shadow-lg flex flex-col", sizeClasses[size])}
        style={{
          backgroundColor: themeSettings.colors.background,
          color: themeSettings.colors.text,
          borderRadius: `${themeSettings.cornerRadius}px`,
          fontFamily: themeSettings.fontFamily,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{
            borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{
              color: themeSettings.colors.text,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-opacity-10 transition-colors"
            style={{
              color: themeSettings.colors.text,
              backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
              cursor: "pointer",
            }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">{content}</div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-3 p-6 border-t"
            style={{
              borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

EditorModal.craft = {
  displayName: "Modal",
};
