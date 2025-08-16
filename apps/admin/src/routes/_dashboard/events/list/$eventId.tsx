import { useArchiveEvent, useUnarchiveEvent } from "@/hooks/mutations/useEvent";
import { useAuth } from "@/hooks/useAuth";
import { Edit, Archive, RotateCcw, MoreHorizontal } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@tribe-nest/frontend-shared";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { getCountryName } from "@/utils/countryCodes";
import { Link } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  type ApiError,
} from "@tribe-nest/frontend-shared";
import { useState } from "react";
import { toast } from "sonner";
import PageHeader from "../../-components/layout/page-header";
import { useEvent } from "@/hooks/queries/useEvents";
import { EditEventDialog } from "./-components/edit-event-dialog";
import { formatDateTimeLocale } from "@/utils/date";

export const Route = createFileRoute("/_dashboard/events/list/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { mutateAsync: archiveEvent } = useArchiveEvent();
  const { mutateAsync: unarchiveEvent } = useUnarchiveEvent();
  const { currentProfileAuthorization } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { eventId } = Route.useParams();
  const { data: event } = useEvent(eventId, currentProfileAuthorization?.profileId);
  const isArchived = !!event?.archivedAt;

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleArchiveClick = async () => {
    if (!event) return;
    try {
      await archiveEvent({ id: event.id, profileId: currentProfileAuthorization!.profileId });
      toast.success("Event archived successfully");
    } catch (error) {
      const message = (error as ApiError).response?.data?.message;
      toast.error(message || "Failed to archive event");
    }
  };

  const handleUnarchiveClick = async () => {
    if (!event) return;
    try {
      await unarchiveEvent({ id: event.id, profileId: currentProfileAuthorization!.profileId });
      toast.success("Event restored successfully");
    } catch (error) {
      const message = (error as ApiError).response?.data?.message;
      toast.error(message || "Failed to unarchive event");
    }
  };

  return (
    <div>
      <PageHeader
        title="Events"
        description="Manage your events and their details"
        action={
          <div className="">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                  <MoreHorizontal className="w-8 h-8 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditClick}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {isArchived ? (
                  <DropdownMenuItem onClick={handleUnarchiveClick}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Unarchive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleArchiveClick}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {event && (
        <Card className={`transition-all duration-200 ${isArchived ? "opacity-60" : ""}`}>
          <CardContent>
            {isArchived && (
              <div className="absolute top-4 left-4">
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                  Archived
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Link
                  to={`/events/list/$eventId`}
                  params={{ eventId: event.id }}
                  className="text-xl font-bold mb-2 hover:underline"
                >
                  {event.title}
                </Link>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDateTimeLocale(event.dateTime)}</span>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{event.address.name}</div>
                    <div className="text-muted-foreground">
                      {event.address.street}
                      {event.address.zipCode && `, ${event.address.zipCode}`}
                    </div>
                    <div className="text-muted-foreground">
                      {event.address.city}, {getCountryName(event.address.country)}
                    </div>
                  </div>
                </div>
              </div>

              <p>Details:</p>
              <p dangerouslySetInnerHTML={{ __html: event.description || "" }}></p>

              {event.actionText && event.actionLink && (
                <div className="pt-4 border-t">
                  <a
                    href={event.actionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    {event.actionText}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {event && <EditEventDialog event={event} isOpen={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />}
    </div>
  );
}
