"use client";
import { type UserComponent, useNode } from "@craftjs/core";
import { type IEvent } from "../../../../types";
import { useEditorContext } from "../../context";
import { useEffect, useState } from "react";
import { UpcomingEventsSettings } from "./Settings";
import { Calendar, ExternalLink, MapPin } from "lucide-react";
import { addAlphaToHexCode } from "../../../../lib/utils";
import { EditorButtonWithoutEditor } from "../Button";

type UpcomingEventsProps = {
  title: string;
};

export const UpcomingEvents: UserComponent<UpcomingEventsProps> = ({ title }: UpcomingEventsProps) => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const { httpClient, themeSettings, profile, navigate } = useEditorContext();

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const {
    connectors: { connect },
  } = useNode();

  useEffect(() => {
    httpClient
      ?.get(`/public/events`, {
        params: {
          profileId: profile?.id,
        },
      })
      .then((res) => {
        setEvents(res.data);
      });
  }, [httpClient, profile?.id]);

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(ref);
        }
      }}
      className="w-full @md:p-8 p-4 flex flex-col items-center"
    >
      <h1 className="text-2xl font-bold text-center @md:text-left mb-6">{title}</h1>

      <div className="flex gap-4 flex-col @md:flex-row w-full flex-wrap items-center @md:items-start">
        {events.map((event) => (
          <div
            style={{
              width: "300px",
              border: `1px solid ${addAlphaToHexCode(themeSettings.colors.text, 0.1)}`,
              borderRadius: `${themeSettings.cornerRadius}px`,
              padding: "16px",
              color: themeSettings.colors.text,
            }}
            key={event.id}
          >
            <div>
              <h3 className="text-lg font-bold mb-2">{event.title}</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{formatDateTime(event.dateTime)}</span>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5" />
                <div>
                  <div className="font-medium">{event.address.name}</div>
                  <div
                    style={{
                      color: addAlphaToHexCode(themeSettings.colors.text, 0.7),
                    }}
                  >
                    {event.address.street}
                    {event.address.zipCode && `, ${event.address.zipCode}`}
                  </div>
                  <div
                    style={{
                      color: addAlphaToHexCode(themeSettings.colors.text, 0.7),
                    }}
                  >
                    {event.address.city}, {event.address.country}
                  </div>
                </div>
              </div>
            </div>

            {event.actionText && event.actionLink && event.tickets.length < 1 && (
              <div className="pt-4">
                <a
                  href={event.actionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm hover:underline"
                  style={{
                    border: `1px solid ${addAlphaToHexCode(themeSettings.colors.primary, 0.7)}`,
                    borderRadius: `${themeSettings.cornerRadius}px`,
                    padding: "8px 16px",
                    color: themeSettings.colors.text,
                  }}
                >
                  {event.actionText}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {event.tickets.length > 0 && (
              <div className="pt-4">
                <EditorButtonWithoutEditor
                  variant="secondary"
                  onClick={() => {
                    navigate(`/events/${event.id}`);
                  }}
                  text="Details"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

UpcomingEvents.craft = {
  displayName: "Upcoming Events",
  props: {
    title: "Upcoming Events",
  },
  related: {
    toolbar: UpcomingEventsSettings,
  },
};
