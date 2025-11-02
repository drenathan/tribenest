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

export const getImageTextColor = (imageUrl: string) => {
  if (!imageUrl) return;
  const img = new Image();
  img.crossOrigin = "anonymous"; // Needed for external images
  img.src = imageUrl;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const w = (canvas.width = img.width);
  const h = (canvas.height = img.height);
  if (!ctx) return;
  ctx.drawImage(img, 0, 0, w, h);

  const { data } = ctx.getImageData(0, 0, w, h);
  let r = 0,
    g = 0,
    b = 0;
  const count = w * h;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  r /= count;
  g /= count;
  b /= count;

  // perceived brightness formula
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

  return brightness > 128 ? "#000000" : "#FFFFFF";
};

export const rgbToHex = (r: number, g: number, b: number, a: number) => {
  // Ensure values are within valid ranges
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  // Convert to 2-digit hex
  const toHex = (x: number) => x.toString(16).padStart(2, "0");

  // If alpha exists and is less than 1, include it in hex
  if (a !== undefined && a < 1) {
    const alpha = Math.round(a * 255);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
