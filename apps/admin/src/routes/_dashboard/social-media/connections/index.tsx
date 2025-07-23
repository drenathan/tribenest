import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "../../-components/coming-soon";

export const Route = createFileRoute("/_dashboard/social-media/connections/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ComingSoon />;
}
