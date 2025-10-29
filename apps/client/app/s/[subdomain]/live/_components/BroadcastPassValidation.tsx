"use client";
import React, { useState } from "react";
import { ILiveBroadcast } from "./types";
import {
  addAlphaToHexCode,
  ApiError,
  EditorButtonWithoutEditor,
  EditorInputWithoutEditor,
  EditorModal,
  IEvent,
  useEditorContext,
} from "@tribe-nest/frontend-shared";
import { EventTickets } from "../../events/[id]/_components/EventTickets";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type Props = {
  broadcast: ILiveBroadcast;
  onSuccess: (sessionId: string) => void;
};
export function BroadcastPassValidation({ broadcast, onSuccess }: Props) {
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const { themeSettings, httpClient, profile } = useEditorContext();
  const [ticketCode, setTicketCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: event } = useQuery<IEvent>({
    queryKey: ["event", broadcast?.eventId, profile?.id],
    enabled: !!broadcast?.eventId && !!profile?.id,
    queryFn: async () => {
      const response = await httpClient!.get(`/public/events/${broadcast?.eventId}`, {
        params: {
          profileId: profile?.id,
        },
      });
      return response.data;
    },
  });

  const minPrice = broadcast.eventTickets?.reduce((min, ticket) => {
    return Math.min(min, ticket.price);
  }, Infinity);

  const handleValidatePass = async () => {
    const trimmedTicketCode = ticketCode.trim(); // in case the user copies the ticket code with a space at the end
    if (!trimmedTicketCode || !broadcast.id || !httpClient) return;
    setIsLoading(true);

    try {
      const response = await httpClient!.post(`/public/events/validate-pass`, {
        broadcastId: broadcast.id,
        eventPassId: trimmedTicketCode,
        sessionId: localStorage.getItem(`broadcast_${broadcast.id}_session_id`) || undefined,
      });
      onSuccess(response.data);
    } catch (error) {
      console.error(error);
      const message = (error as ApiError)?.response?.data?.message || "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center px-4">
      {event && (
        <EditorModal
          isOpen={isTicketsModalOpen}
          onClose={() => setIsTicketsModalOpen(false)}
          title={event.title}
          size="2xl"
          content={<EventTickets event={event} />}
          promptBeforeClose={true}
          promptMessage="Are you sure you want to leave checkout?"
        />
      )}
      <div
        key={broadcast.id}
        className="group mt-4 max-w-[500px] w-full mx-auto"
        style={{
          backgroundColor: themeSettings.colors.background,
          borderRadius: `${themeSettings.cornerRadius}px`,
          boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
          border: `1px solid ${themeSettings.colors.primary}30`,
        }}
      >
        <div className="relative">
          <div
            className="aspect-video flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${themeSettings.colors.primary}20, ${themeSettings.colors.primary}10)`,
            }}
          >
            {(broadcast.thumbnailUrl || broadcast.generatedThumbnailUrl) && (
              <img
                src={broadcast.thumbnailUrl || broadcast.generatedThumbnailUrl}
                alt={broadcast.title}
                className="w-full h-full object-cover absolute top-0 left-0"
              />
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <h3
            className="font-semibold mb-2 line-clamp-2 transition-colors group-hover:opacity-80"
            style={{ color: themeSettings.colors.text }}
          >
            {broadcast.title}
          </h3>

          <div className="flex items-center text-sm space-x-2"></div>
        </div>
      </div>

      <div className="mt-4 max-w-[500px] w-full mx-auto flex flex-col gap-4 items-center">
        <p>Enter your ticket ID to join the broadcast</p>
        <EditorInputWithoutEditor
          width="100%"
          placeholder="Enter your ticket code"
          value={ticketCode}
          onChange={(value) => setTicketCode(value)}
        />
        <EditorButtonWithoutEditor
          fullWidth
          text={isLoading ? "Validating..." : "Join Broadcast"}
          disabled={!ticketCode || isLoading}
          onClick={handleValidatePass}
        />
        <p className="my-4">OR</p>

        {event && (
          <div
            className="md:w-80 flex flex-col gap-2 p-4 items-center shrink-0 w-full"
            style={{
              color: themeSettings.colors.text,
              border: `1px solid ${addAlphaToHexCode(themeSettings.colors.primary, 0.5)}`,
              borderRadius: themeSettings.cornerRadius,
              backgroundColor: themeSettings.colors.background,
            }}
          >
            <EditorButtonWithoutEditor onClick={() => setIsTicketsModalOpen(true)} fullWidth text="Buy tickets" />
            <p>From ${minPrice}</p>
          </div>
        )}
      </div>
    </div>
  );
}
