export const breadcrumbs: Record<
  string,
  {
    links?: { label: string; href?: string; goBack?: boolean }[];
    currentPage: string;
  }
> = {
  "/tribe/membership-tiers": {
    links: [{ label: "Home", href: "/" }],
    currentPage: "Membership Tiers",
  },
  "/tribe/membership-tiers/create": {
    links: [
      { label: "Tribe", href: "/tribe" },
      { label: "Membership Tiers", href: "/tribe/membership-tiers" },
    ],
    currentPage: "Create Membership Tier",
  },
  "/tribe/posts": {
    links: [{ label: "Home", href: "/" }],
    currentPage: "Posts",
  },
  "/tribe/posts/create": {
    links: [
      { label: "Tribe", href: "/tribe" },
      { label: "Posts", href: "/tribe/posts" },
    ],
    currentPage: "Create Post",
  },
  "/tribe/posts/$postId/edit": {
    links: [
      { label: "Tribe", href: "/tribe" },
      { label: "Posts", goBack: true },
    ],
    currentPage: "Edit Post",
  },
  "/tribe/members": {
    links: [{ label: "Home", href: "/" }],
    currentPage: "Members",
  },
  "/store/music": {
    links: [{ label: "Home", href: "/" }],
    currentPage: "Music",
  },
  "/store/music/create": {
    links: [
      { label: "Home", href: "/" },
      { label: "Music", goBack: true },
    ],
    currentPage: "Add Music",
  },
  "/store/orders": {
    links: [{ label: "Home", href: "/" }],
    currentPage: "Orders",
  },
  "/store/orders/$orderId": {
    links: [
      { label: "Home", href: "/" },
      { label: "Orders List", goBack: true },
    ],
    currentPage: "Order",
  },
  "/website/themes": {
    links: [{ label: "Website", href: "/website/home" }],
    currentPage: "Themes",
  },
  "/website/analytics": {
    links: [{ label: "Website", href: "/website/home" }],
    currentPage: "Analytics",
  },
  "/website/home": {
    links: [{ label: "Home", href: "/" }],
    currentPage: "Website Home",
  },
  "/website/themes/create": {
    links: [
      { label: "Website", href: "/website/home" },
      { label: "Themes", href: "/website/themes" },
    ],
    currentPage: "Create Theme",
  },
  "/emails/lists": {
    links: [{ label: "Home", href: "/" }],
    currentPage: "Email Lists",
  },
  "/emails/templates": {
    links: [{ label: "Home", href: "/" }],
    currentPage: "Email Templates",
  },
  "/smart-links/links": {
    links: [{ label: "Home", href: "/" }],
    currentPage: "Smart Links",
  },
  "/smart-links/links/$smartLinkId/analytics": {
    links: [
      { label: "Home", href: "/" },
      { label: "Smart Links", goBack: true },
    ],
    currentPage: "Analytics",
  },
  "/smart-links/templates": {
    links: [{ label: "Home", href: "/" }],
    currentPage: "Smart Link Templates",
  },
  "/events/list": {
    links: [{ label: "Home", href: "/" }],
    currentPage: "Events",
  },
  "/events/list/create": {
    links: [
      { label: "Home", href: "/" },
      { label: "Events", goBack: true },
    ],
    currentPage: "Create Event",
  },
  "/events/list/$eventId": {
    links: [
      { label: "Home", href: "/" },
      { label: "Events", goBack: true },
    ],
    currentPage: "Event",
  },
  "/events/sales": {
    links: [
      { label: "Home", href: "/" },
      { label: "Events", href: "/events/list" },
    ],
    currentPage: "Sales Report",
  },
};
