import httpClient from "@/services/httpClient";
import { Profile, SmartLink } from "@tribe-nest/frontend-shared";
import { ILiveBroadcast } from "../live/_components/types";
export type WebPage = {
  themeName: string;
  themeVersion: string;
  page: {
    title: string;
    description: string;
    content: string;
    pathname: string;
  };
  profile: Profile & { subdomain: string };
  themeSettings: {
    colors: {
      primary: string;
      background: string;
      text: string;
      textPrimary: string;
    };
    cornerRadius: string;
    fontFamily: string;
    logo: string;
    headerLinks: {
      label: string;
      href: string;
    }[];
    socialLinks: {
      icon: string;
      href: string;
    }[];
  };
};

const getWebPage = async ({ subdomain, pathname }: { subdomain: string; pathname: string }) => {
  try {
    const response = await httpClient.get(`/public/websites?subdomain=${subdomain}&pathname=${pathname}`);

    return response.data as WebPage;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBroadcast = async ({ id, profileId }: { id: string; profileId: string }) => {
  try {
    const response = await httpClient.get(`/public/broadcasts/${id}`, {
      params: {
        profileId,
      },
    });

    return response.data as ILiveBroadcast;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getSmartLink = async ({ path }: { path: string }) => {
  try {
    const response = await httpClient.get(`/public/smart-links?path=${path}`);

    return response.data as SmartLink;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { getWebPage, getSmartLink };
