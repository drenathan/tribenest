import * as React from "react";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { AuthContextType } from "@/types/auth";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@tribe-nest/frontend-shared";

interface RouterContext {
  auth: AuthContextType;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

const queryClient = new QueryClient();

function RootComponent() {
  return (
    <React.Fragment>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <Toaster closeButton position="top-center" />
        </QueryClientProvider>

        {/* <TanStackRouterDevtools /> */}
      </ThemeProvider>
    </React.Fragment>
  );
}
