import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/store/music/$productId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_dashboard/store/music/$productId/edit"!</div>;
}
