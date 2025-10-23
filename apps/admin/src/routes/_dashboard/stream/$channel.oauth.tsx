import Loading from "@/components/loading";
import { useAuth } from "@/hooks/useAuth";
import httpClient from "@/services/httpClient";
import { StreamChannelProvider } from "@/types/event";
import { createFileRoute } from "@tanstack/react-router";
import type { ApiError } from "@tribe-nest/frontend-shared";
import { useEffect } from "react";
import { toast } from "sonner";
import z from "zod";

const paramsSchema = z.object({
  code: z.string(),
});

export const Route = createFileRoute("/_dashboard/stream/$channel/oauth")({
  component: RouteComponent,
  validateSearch: paramsSchema,
});

function RouteComponent() {
  const { channel } = Route.useParams();
  const { currentProfileAuthorization } = useAuth();
  const search = Route.useSearch();

  useEffect(() => {
    if (!currentProfileAuthorization?.profileId) {
      return;
    }

    const handleOAuth = async () => {
      switch (channel) {
        case StreamChannelProvider.Youtube:
        case StreamChannelProvider.Twitch:
          {
            try {
              const { data } = await httpClient.get(`/streams/oauth/${channel}/token`, {
                params: {
                  code: search.code,
                  profileId: currentProfileAuthorization?.profileId,
                },
              });
              if (data.existingChannel) {
                window.opener.postMessage(
                  {
                    type: "channel_exists",
                  },
                  window.location.origin,
                );
              } else {
                window.opener.postMessage(
                  {
                    type: "channel_created",
                  },
                  window.location.origin,
                );
              }
              window.close();
            } catch (error) {
              const message = (error as ApiError).response?.data?.message || "Failed to get OAuth token";
              window.opener.postMessage(
                {
                  type: "oauth_error",
                  error: message,
                },
                window.location.origin,
              );
            }
            window.close();
          }
          break;
        default:
          toast.error("Invalid channel");
          break;
      }
    };

    handleOAuth();
  }, [channel, currentProfileAuthorization?.profileId, search]);

  return <Loading />;
}
