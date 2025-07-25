import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "../../-components/coming-soon";

export const Route = createFileRoute("/_dashboard/store/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ComingSoon />;
}
