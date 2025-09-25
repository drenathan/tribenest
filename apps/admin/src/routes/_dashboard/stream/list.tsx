import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/stream/list")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_dashboard/stream/list"!</div>;
}
