"use client";

import {
  Calendar,
  ChevronRight,
  Globe,
  House,
  Link2Icon,
  Mails,
  Settings,
  // Share2,
  ShoppingBag,
  Users,
  Video,
} from "lucide-react";

type NavItem = {
  title: string;
  path: string;
  icon?: React.ElementType;
  items?: NavItem[];
};

const items: NavItem[] = [
  {
    title: "My Website",
    path: "/website",
    icon: Globe,
    items: [
      {
        title: "Home",
        path: "/website/home",
      },
      {
        title: "Analytics",
        path: "/website/analytics",
      },
      {
        title: "Themes",
        path: "/website/themes",
      },
      {
        title: "Messages",
        path: "/website/messages",
      },
    ],
  },
  {
    title: "My Tribe",
    path: "/tribe",
    icon: Users,
    items: [
      {
        title: "Membership Tiers",
        path: "/tribe/membership-tiers",
      },
      {
        title: "Posts",
        path: "/tribe/posts",
      },
      {
        title: "Members",
        path: "/tribe/members",
      },
      {
        title: "Messages",
        path: "/tribe/messages",
      },
    ],
  },
  {
    title: "Store",
    path: "/store",
    icon: ShoppingBag,
    items: [
      {
        title: "Music",
        path: "/store/music",
      },
      {
        title: "Merch",
        path: "/store/products",
      },
      {
        title: "Orders",
        path: "/store/orders",
      },
    ],
  },
  {
    title: "Emails",
    path: "/emails",
    icon: Mails,
    items: [
      {
        title: "Templates",
        path: "/emails/templates",
      },
      {
        title: "Emails",
        path: "/emails/emails",
      },
      {
        title: "Email Lists",
        path: "/emails/lists",
      },
    ],
  },
  {
    title: "Smart Links",
    path: "/smart-links",
    icon: Link2Icon,
    items: [
      {
        title: "Links",
        path: "/smart-links/links",
      },
      {
        title: "Templates",
        path: "/smart-links/templates",
      },
    ],
  },
  {
    title: "Events",
    path: "/events",
    icon: Calendar,
    items: [
      {
        title: "My Events",
        path: "/events/list",
      },
      {
        title: "Orders",
        path: "/events/sales",
      },
    ],
  },
  {
    title: "Live Stream",
    path: "/stream",
    icon: Video,
    items: [
      {
        title: "Studio",
        path: "/stream/list",
      },
      {
        title: "Channels",
        path: "/stream/channels",
      },
    ],
  },
  // {
  //   title: "Social Media",
  //   path: "/social-media",
  //   icon: Share2,
  //   items: [
  //     {
  //       title: "Connections",
  //       path: "/social-media/connections",
  //     },
  //   ],
  // },
];

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
  useSidebar,
} from "@tribe-nest/frontend-shared";
import { Link, useRouterState } from "@tanstack/react-router";

export function NavMain() {
  const routeState = useRouterState();
  const { toggleSidebar, isMobile } = useSidebar();

  const isActive = (path: string) => {
    const pathname = routeState.location.pathname;
    return path === pathname || pathname.startsWith(path + "/");
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem className={cn(isActive("/") && "bg-primary rounded")}>
          <Link className="flex items-center" to="/">
            <SidebarMenuButton tooltip={"Home"}>
              <House />
              <span>Home</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={isActive(item.path)} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className="cursor-pointer">
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem
                      key={subItem.title}
                      className={cn(isActive(subItem.path) && "bg-primary rounded-md")}
                    >
                      <SidebarMenuSubButton asChild>
                        <Link onClick={() => isMobile && toggleSidebar()} to={subItem.path}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
        <SidebarMenuItem className={cn(isActive("/settings") && "bg-primary rounded")}>
          <Link className="flex items-center" to="/settings">
            <SidebarMenuButton tooltip={"Settings"}>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
