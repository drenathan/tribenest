import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/store/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Coming soon</div>;
}
