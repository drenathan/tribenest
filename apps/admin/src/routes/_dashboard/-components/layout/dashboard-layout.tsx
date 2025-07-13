import { useEffect } from "react";
import { AppSidebar } from "./sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger, Separator, AudioPlayerProvider } from "@tribe-nest/frontend-shared";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useGetProfileAuthorizations } from "@/hooks/queries/useGetProfileAuthorizations";
import { breadcrumbs } from "../breadcrumbs";
import Breadcrumbs from "../breadcrumb";
import { SimpleLogo } from "@/components/simple-logo";
import { GlobalAudioPlayer } from "./GlobalAudioPlayer";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentProfileAuthorization, setCurrentProfileAuthorization } = useAuth();
  const { data: profileAuthorizations } = useGetProfileAuthorizations();
  const navigate = useNavigate();
  const routerState = useRouterState();

  const fullPath = routerState.matches.slice(-1)[0].fullPath;
  const breadcrumb = breadcrumbs[fullPath.endsWith("/") ? fullPath.slice(0, -1) : fullPath];

  const isEditingTheme = !!routerState.matches.find((match) =>
    ["/website/themes/$slug/preview", "/website/home/$versionId/edit"].includes(match.fullPath),
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (profileAuthorizations?.length && !currentProfileAuthorization) {
      setCurrentProfileAuthorization(profileAuthorizations[0]);
    }
  }, [profileAuthorizations, currentProfileAuthorization, setCurrentProfileAuthorization]);

  return isEditingTheme ? (
    <div>{children}</div>
  ) : (
    <AudioPlayerProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="border-sidebar border-8">
          <header className="hidden md:flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              {breadcrumb && <Breadcrumbs links={breadcrumb.links} currentPage={breadcrumb.currentPage} />}
            </div>
          </header>
          <header className="flex md:hidden h-16 shrink-0 items-center px-4 justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border bg-sidebar">
            <SimpleLogo />
            <div className="flex items-center gap-2">
              <SidebarTrigger isMobile />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 rounded-xl items-center text-foreground">
            <div className="w-full xl:w-[1000px] mt-8 pb-12">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <GlobalAudioPlayer />
    </AudioPlayerProvider>
  );
}
