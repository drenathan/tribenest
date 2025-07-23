import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "./-components/layout/dashboard-layout";
import { useGetProfileAuthorizations } from "@/hooks/queries/useGetProfileAuthorizations";
import CreateProfile from "./-components/create-profile";
import Loading from "@/components/loading";

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async ({ context }) => {
    const isAuthenticated = await context.auth.initialize();
    if (!isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: profileAuthorizations, isLoading } = useGetProfileAuthorizations();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!profileAuthorizations || profileAuthorizations.length === 0) {
    return <CreateProfile />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
