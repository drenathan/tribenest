export const DEFAULT_THEME_PAGES = [
  {
    title: "Home",
    pathname: "/",
  },
  {
    title: "Members",
    pathname: "/members",
  },
  {
    title: "Contact",
    pathname: "/contact",
  },
  {
    title: "Terms of Service",
    pathname: "/terms-of-service",
  },
  {
    title: "Privacy Policy",
    pathname: "/privacy-policy",
  },
  {
    title: "Cookie Policy",
    pathname: "/cookie-policy",
  },
];

export type TrackEventInput = {
  subdomain: string;
  eventType: string;
  eventData: Record<string, any>;
  ip?: string;
};
