import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/tribe/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_dashboard/home"!</div>;
}
