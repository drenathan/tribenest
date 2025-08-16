import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "../../../-components/layout/page-header";
import { CreateEventForm } from "./-components/create-event-form";

export const Route = createFileRoute("/_dashboard/events/list/create/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <PageHeader title="Create Event" description="Add a new event to your community" />
      <CreateEventForm />
    </div>
  );
}
