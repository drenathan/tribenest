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

export type IWebsiteMessage = {
  id: string;
  profileId: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type IWebsiteAnalytics = {
  analytics: {
    totalEvents: number;
    pageViews: number;
    clicks: number;
    visits: number;
  };
  countries: {
    country: string;
    pageViews: number;
    clicks: number;
    visits: number;
  }[];
  cities: {
    city: string;
    pageViews: number;
    clicks: number;
    visits: number;
  }[];
  pages: {
    pathname: string;
    pageViews: number;
  }[];
};
