import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "../../-components/coming-soon";

export const Route = createFileRoute("/_dashboard/events/sales/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ComingSoon />;
}
