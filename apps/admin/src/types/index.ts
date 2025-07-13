import type { EditorTheme } from "@tribe-nest/frontend-shared";
import type React from "react";

export type ThemePage = {
  pathname: string;
  title: string;
  description?: string;
  Component: React.ComponentType;
};

export type ThemeConfig = {
  name: string;
  slug: string;
  description: string;
  author: string;
  version: string;
  thumbnail: string;
  preview: string;
  themeSettings: EditorTheme;
  pages: ThemePage[];
};
