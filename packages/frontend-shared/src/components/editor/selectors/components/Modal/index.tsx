"use client";
import React, { useEffect } from "react";
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
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  closeOnOverlayClick?: boolean;
  promptBeforeClose?: boolean;
  promptMessage?: string;
}

export const EditorModal: UserComponent<ModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  promptBeforeClose = false,
  promptMessage = "Are you sure you want to close this modal?",
}) => {
  const { themeSettings } = useEditorContext();

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      if (promptBeforeClose) {
        if (confirm(promptMessage)) {
          onClose();
        }
      } else {
        onClose();
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
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
        className={cn(
          "relative w-full md:mx-4 rounded-lg shadow-lg flex flex-col max-h-full md:max-h-[90vh] overflow-y-auto",
          sizeClasses[size],
        )}
        style={{
          backgroundColor: themeSettings.colors.background,
          color: themeSettings.colors.text,
          borderRadius: `${themeSettings.cornerRadius}px`,
          fontFamily: themeSettings.fontFamily,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between md:p-6 p-4 border-b"
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
            onClick={() => {
              if (promptBeforeClose) {
                if (confirm(promptMessage)) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
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
        <div className="flex-1 md:p-6 p-4 overflow-y-auto">{content}</div>

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
