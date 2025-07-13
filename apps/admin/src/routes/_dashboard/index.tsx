import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "./-components/layout/page-header";

export const Route = createFileRoute("/_dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <PageHeader title="Welcome" />
    </div>
  );
}
