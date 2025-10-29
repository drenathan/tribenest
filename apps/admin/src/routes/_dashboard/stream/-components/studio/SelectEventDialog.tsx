import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "@tribe-nest/frontend-shared";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/queries/useEvents";
import { useEffect, useState } from "react";
import EmptyState from "@/components/empty-state";
import { Link } from "@tanstack/react-router";
import EventItem from "@/routes/_dashboard/events/list/-components/event-item";
import type { IEvent } from "@/types/event";
import { debounce } from "lodash";
import Loading from "@/components/loading";
import { useParticipantStore } from "../store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: IEvent[];
  defaultSearch?: string;
}

function SelectEventDialog({ open, onOpenChange }: Props) {
  const { currentProfileAuthorization } = useAuth();
  const [query, setQuery] = useState("");
  const { data: events, isLoading } = useEvents(currentProfileAuthorization?.profileId, { query });
  const { linkedEvent, setLinkedEvent } = useParticipantStore();

  const isEmpty = !isLoading && !events?.data?.length;

  const handleQueryChange = debounce((value: string) => {
    setQuery(value);
  }, 500);

  useEffect(() => {
    if (events?.data) {
      setLinkedEvent(null);
    }
  }, [events, setLinkedEvent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] min-h-[500px]">
        <DialogHeader>
          <DialogTitle>Select Event</DialogTitle>
          <DialogDescription>Select an event to link to the broadcast</DialogDescription>
        </DialogHeader>
        <Input placeholder="Search events" onChange={(e) => handleQueryChange(e.target.value)} />
        {isLoading && <Loading />}

        {isEmpty && (
          <EmptyState
            title="No events found"
            description="Create an event to get started"
            action={
              <Button>
                <Link to="/events/list/create">Create New</Link>
              </Button>
            }
          />
        )}

        <div className="mt-6 grid grid-cols-3 gap-4">
          {events?.data?.map((event) => {
            const isLinked = linkedEvent?.id === event.id;
            return (
              <div
                key={event.id}
                className={cn(
                  linkedEvent?.id === event.id ? "border border-primary" : "",
                  "transition-all duration-200",
                )}
              >
                <EventItem
                  key={event.id}
                  event={event}
                  onClick={() => (isLinked ? setLinkedEvent(null) : setLinkedEvent(event))}
                />
              </div>
            );
          })}
        </div>

        {!isEmpty && (
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Save</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SelectEventDialog;
