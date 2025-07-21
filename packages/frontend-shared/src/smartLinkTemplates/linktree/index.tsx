import type { SmartLinkTemplate } from "../../types";
import LinkTreeComponent from "./Component";

const linkTreeTemplate: SmartLinkTemplate = {
  title: "Link Tree",
  slug: "link-tree",
  version: "1.0.0",
  thumbnail: "https://cdn.coumo.com/geo-chierchia-o-9-fSSiCT0-unsplash.jpg",
  preview: "https://cdn.coumo.com/geo-chierchia-o-9-fSSiCT0-unsplash.jpg",
  themeSettings: {
    colors: {
      primary: "#c90ca0",
      background: "#020838",
      text: "#ffffff",
      textPrimary: "#ffffff",
    },
    cornerRadius: "10",
    fontFamily: "Arial",
    logo: "https://cdn.coumo.com/geo-chierchia-o-9-fSSiCT0-unsplash.jpg",
    headerLinks: [],
    socialLinks: [
      { href: "https://www.instagram.com", icon: "instagram" },
      { href: "https://www.facebook.com", icon: "facebook" },
      { href: "https://www.twitter.com", icon: "twitter" },
      { href: "https://www.youtube.com", icon: "youtube" },
    ],
  },
  editorResolver: {},
  Component: LinkTreeComponent,
};

export default linkTreeTemplate;
