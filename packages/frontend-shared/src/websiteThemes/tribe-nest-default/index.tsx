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
import { ProductItem } from "./components/ProductItem";
import { MusicItemDetails } from "./components/MusicItemDetails";
import { ProductDetails } from "./components/ProductDetails";
import ContactPage from "./contact";
import { ContactPageContent } from "./components/ContactPageContent";

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
      text: "#ffffff",
      primary: "#d4bbcf",
      background: "#1c1d29",
      textPrimary: "#160404",
    },
    cornerRadius: "10",
    fontFamily: "Arial",
    logo: "https://assets-dev.coumo.com/default_theme_screenshot.png",
    headerLinks: [
      { href: "/members", label: "Members" },
      { href: "/products?category=Music", label: "Store" },
      { href: "/contact", label: "Contact" },
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
      pathname: "/contact",
      title: "Contact",
      Component: ContactPage,
    },
    {
      pathname: "/members",
      title: "Members",
      Component: MembersPage,
    },
    {
      pathname: "/products",
      title: "Store",
      Component: MusicPage,
    },
    {
      pathname: "/products/:id",
      title: "Store Item",
      Component: MusicDetailsPage,
    },
    {
      pathname: "/music",
      title: "Store",
      Component: MusicPage,
      deprecated: true,
    },
    {
      pathname: "/music/:id",
      title: "Store Item",
      Component: MusicDetailsPage,
      deprecated: true,
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
    ProductItem,
    MusicItemDetails,
    ProductDetails,
    ContactPageContent,
  },
} as ThemeConfig;
