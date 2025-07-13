import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./contexts/AuthContext";
import { AppConfigProvider } from "./contexts/AppConfigContext";

// Create a new router instance
const router = createRouter({ routeTree, scrollRestoration: true, context: { auth: undefined! } });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppConfigProvider>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </AppConfigProvider>
  </StrictMode>,
);
