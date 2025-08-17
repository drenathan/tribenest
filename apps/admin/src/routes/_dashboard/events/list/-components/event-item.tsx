import type { IEvent } from "@/types/event";
import { Card, CardContent } from "@tribe-nest/frontend-shared";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { getCountryName } from "@/utils/countryCodes";
import { Link } from "@tanstack/react-router";

type Props = {
  event: IEvent;
};

function EventItem({ event }: Props) {
  const isArchived = !!event.archivedAt;

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className={`relative transition-all duration-200 ${isArchived ? "opacity-60" : ""}`}>
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
              <span>{formatDateTime(event.dateTime)}</span>
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
  );
}

export default EventItem;
