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
