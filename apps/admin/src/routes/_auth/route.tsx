import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthLayout } from "./-components/auth-layout";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
