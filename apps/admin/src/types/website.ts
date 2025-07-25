import type { EditorTheme } from "@tribe-nest/frontend-shared";

export type WebsiteVersion = {
  profile: string;
  pages: WebsiteVersionPage[];
  themeSettings: EditorTheme;
  slug: string;
  version: string;
  themeName: string;
  themeVersion: string;
  themeThumbnail: string;
  id: string;
  isActive: boolean;
};

export type WebsiteVersionPage = {
  pathname: string;
  content: string;
  title: string;
  description?: string;
};
