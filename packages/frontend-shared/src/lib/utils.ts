import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const alphaToHexCode = (alpha: number) => {
  return Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
};

export const addAlphaToHexCode = (hexCode: string, alpha: number) => {
  return `${hexCode}${alphaToHexCode(alpha)}`;
};

export const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return date.toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export function getContrastColor(hex: string) {
  // Remove '#' if present
  hex = hex.replace("#", "");

  // Convert shorthand hex (#abc → #aabbcc)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance (simple formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black for light backgrounds, white for dark
  return brightness > 128 ? "#000000" : "#FFFFFF";
}
