"use client";

import { ChevronRight, Globe, House, Link2Icon, Mails, ShoppingBag, Users } from "lucide-react";

type NavItem = {
  title: string;
  url: string;
  icon?: React.ElementType;
  items?: NavItem[];
};

const items: NavItem[] = [
  {
    title: "My Website",
    url: "/website",
    icon: Globe,
    items: [
      {
        title: "Home",
        url: "/website/home",
      },
      {
        title: "Themes",
        url: "/website/themes",
      },
    ],
  },
  {
    title: "My Tribe",
    url: "/tribe",
    icon: Users,
    items: [
      {
        title: "Membership Tiers",
        url: "/tribe/membership-tiers",
      },
      {
        title: "Posts",
        url: "/tribe/posts",
      },
      {
        title: "Collections",
        url: "/tribe/collections",
      },
      {
        title: "Members",
        url: "/tribe/members",
      },
      {
        title: "Messages",
        url: "/tribe/messages",
      },
    ],
  },
  {
    title: "Store",
    url: "/store",
    icon: ShoppingBag,
    items: [
      {
        title: "Music",
        url: "/store/music",
      },
      {
        title: "Merch",
        url: "/store/products",
      },
      {
        title: "Orders",
        url: "/store/orders",
      },
      {
        title: "Settings",
        url: "/store/settings",
      },
    ],
  },
  {
    title: "Email Lists",
    url: "#",
    icon: Mails,
    items: [
      {
        title: "Home",
        url: "#",
      },
      {
        title: "Templates",
        url: "#",
      },
    ],
  },
  {
    title: "One Page Links",
    url: "#",
    icon: Link2Icon,
    items: [
      {
        title: "Home",
        url: "#",
      },
    ],
  },
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
          <Collapsible key={item.title} asChild defaultOpen={isActive(item.url)} className="group/collapsible">
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
                      className={cn(isActive(subItem.url) && "bg-primary rounded-md")}
                    >
                      <SidebarMenuSubButton asChild>
                        <Link onClick={() => isMobile && toggleSidebar()} to={subItem.url}>
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
      </SidebarMenu>
    </SidebarGroup>
  );
}
