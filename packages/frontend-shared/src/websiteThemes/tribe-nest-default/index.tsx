import IndexPage from "./index.page";
import PrivacyPolicyPage from "./privacy-policy";
import MembersPage from "./members.page";
import type { ThemeConfig } from "@tribe-nest/frontend-shared";
import { PostsPage } from "./components/PostsPage";
import { ActionButton, PollContent, PostItem, PostMedia } from "./components/PostItem";
import { MusicPageContent } from "./components/MusicPageContent";
import MusicPage from "./music.page";
import { MusicItem } from "./components/MusicItem";
import MusicDetailsPage from "./music-details.page";
import { MusicDetailsContent } from "./components/MusicDetailsContent";
import { Pagination } from "./components/Pagination";

export default {
  name: "TribeNest Default",
  slug: "tribe-nest-default",
  description: "TribeNest Default",
  author: "TribeNest",
  version: "1.0.0",
  thumbnail: "https://assets-dev.coumo.com/default_theme_screenshot.png",
  preview: "https://assets-dev.coumo.com/default_theme_screenshot.png",
  themeSettings: {
    colors: {
      primary: "#c90ca0",
      background: "#020838",
      text: "#ffffff",
      textPrimary: "#ffffff",
    },
    cornerRadius: "10",
    fontFamily: "Arial",
    logo: "https://assets-dev.coumo.com/default_theme_screenshot.png",
    headerLinks: [
      { href: "/members", label: "Members" },
      { href: "/music", label: "Music" },
    ],
    socialLinks: [
      { href: "https://www.instagram.com", icon: "instagram" },
      { href: "https://www.facebook.com", icon: "facebook" },
      { href: "https://www.twitter.com", icon: "twitter" },
      { href: "https://www.youtube.com", icon: "youtube" },
    ],
  },
  pages: [
    {
      pathname: "/",
      title: "Home",
      Component: IndexPage,
    },
    {
      pathname: "/privacy-policy",
      title: "Privacy Policy",
      Component: PrivacyPolicyPage,
    },
    {
      pathname: "/members",
      title: "Members",
      Component: MembersPage,
    },
    {
      pathname: "/music",
      title: "Music",
      Component: MusicPage,
    },
    {
      pathname: "/music/:id",
      title: "Music Item",
      Component: MusicDetailsPage,
    },
  ],
  editorResolver: {
    PostsPage,
    PostItem,
    PollContent,
    PostMedia,
    ActionButton,
    MusicPageContent,
    MusicItem,
    MusicDetailsContent,
    Pagination,
  },
} as ThemeConfig;
