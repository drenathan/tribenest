import { ChevronsUpDown } from "lucide-react";
import { GalleryVerticalEnd } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@tribe-nest/frontend-shared";
import { useAuth } from "@/hooks/useAuth";
import { useGetProfileAuthorizations } from "@/hooks/queries/useGetProfileAuthorizations";

export function ProfileSwitcher() {
  const { isMobile } = useSidebar();
  const { currentProfileAuthorization, setCurrentProfileAuthorization } = useAuth();
  const { data: authorizations } = useGetProfileAuthorizations();

  if (!currentProfileAuthorization) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer flex w-full items-center gap-2 hover:bg-sidebar-accent p-2 rounded-lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">TribeNest</span>
                <span className="truncate text-xs">{currentProfileAuthorization?.profile?.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Profiles</DropdownMenuLabel>
            {authorizations?.map((auth, index) => (
              <DropdownMenuItem
                key={auth?.profile?.name}
                onClick={() => setCurrentProfileAuthorization(auth)}
                className="gap-2 p-2"
              >
                {auth?.profile?.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
