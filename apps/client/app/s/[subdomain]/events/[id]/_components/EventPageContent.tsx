"use client";

import React from "react";
import { InternalPageRenderer } from "../../../_components/internal-page-renderer";
import {
  addAlphaToHexCode,
  EditorButtonWithoutEditor,
  formatDateTime,
  IEvent,
  LoadingState,
  useEditorContext,
} from "@tribe-nest/frontend-shared";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin } from "lucide-react";

function EventPageContent() {
  const { themeSettings, navigate, httpClient, profile } = useEditorContext();
  const { id } = useParams();

  const { data: event, isLoading } = useQuery<IEvent>({
    queryKey: ["event", id, profile?.id],
    enabled: !!id && !!profile?.id,
    queryFn: async () => {
      const response = await httpClient!.get(`/public/events/${id}`, {
        params: {
          profileId: profile?.id,
        },
      });
      return response.data;
    },
  });

  const minPrice = event?.tickets.reduce((min, ticket) => {
    return Math.min(min, ticket.price);
  }, Infinity);

  return (
    <InternalPageRenderer>
      {isLoading && <LoadingState />}
      {!isLoading && !event && <div>404</div>}

      {event && (
        <div
          style={{
            color: themeSettings.colors.text,
          }}
          className="w-full max-w-5xl mx-auto p-6"
        >
          <div className="w-full mb-30">
            <img src={event.media[0]?.url} alt={event.title} className="aspect-[16/4] h-[400px] object-cover" />
            <div className="flex gap-4 mt-4 items-start">
              <div>
                <h1 className="text-3xl font-bold my-4">{event.title}</h1>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 " />
                    <span>{formatDateTime(event.dateTime)}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <div>
                      <div className="font-medium">{event.address.name}</div>
                      <div style={{ color: addAlphaToHexCode(themeSettings.colors.text, 0.7) }}>
                        {event.address.street}
                        {event.address.zipCode && `, ${event.address.zipCode}`}
                      </div>
                      <div style={{ color: addAlphaToHexCode(themeSettings.colors.text, 0.7) }}>
                        {event.address.city}, {event.address.country}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xl font-bold my-6">About this event</p>
                <p dangerouslySetInnerHTML={{ __html: event.description || "" }} />
              </div>
              <div
                className="md:w-80 flex flex-col gap-2 p-4 items-center shrink-0 md:sticky md:top-4 fixed w-full left-0 bottom-0"
                style={{
                  color: themeSettings.colors.text,
                  border: `1px solid ${addAlphaToHexCode(themeSettings.colors.primary, 0.5)}`,
                  borderRadius: themeSettings.cornerRadius,
                  backgroundColor: themeSettings.colors.background,
                }}
              >
                <p>From ${minPrice}</p>
                <EditorButtonWithoutEditor fullWidth text="Buy tickets" />
              </div>
            </div>
          </div>
        </div>
      )}
    </InternalPageRenderer>
  );
}

export default EventPageContent;
