"use client";
import { LoadingState, useEditorContext } from "@tribe-nest/frontend-shared";
import InternalPageRenderer from "../../_components/internal-page-renderer";
import { ILiveBroadcast } from "./types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import ReactPlayer from "react-player";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

export const BroadcastItemContent = () => {
  const { profile, httpClient, themeSettings } = useEditorContext();
  const { broadcastId } = useParams<{ broadcastId: string }>();
  const [updatedBroadcast, setUpdatedBroadcast] = useState<ILiveBroadcast | null>(null);

  const {
    data: broadcast,
    isLoading: isBroadcastLoading,
    error,
  } = useQuery<ILiveBroadcast>({
    queryKey: ["live-broadcast", profile?.id, broadcastId],
    queryFn: async () => {
      const res = await httpClient!.get(`/public/broadcasts/${broadcastId}`, {
        params: { profileId: profile?.id },
      });
      return res.data;
    },
    enabled: !!profile?.id && !!httpClient && !!broadcastId,
  });

  useEffect(() => {
    if (!broadcastId || !profile?.id || !httpClient) return;
    const interval = setInterval(() => {
      httpClient!
        .get(`/public/broadcasts/${broadcastId}`, {
          params: { profileId: profile?.id },
        })
        .then((res) => {
          setUpdatedBroadcast(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }, 5000);
    return () => clearInterval(interval);
  }, [broadcastId, profile?.id, httpClient]);

  const hasEnded = !!updatedBroadcast?.endedAt || !!broadcast?.endedAt;

  return (
    <InternalPageRenderer pagePathname="/live/[id]" backPathname="/live">
      {isBroadcastLoading && <LoadingState />}
      {error && <div>Unable to load broadcast</div>}

      {broadcast && hasEnded && (
        <div className="px-4">
          <div
            key={broadcast.id}
            className="group mt-10 max-w-[500px] mx-auto"
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
                  ...(broadcast.thumbnailUrl || broadcast.generatedThumbnailUrl
                    ? { backgroundImage: `url(${broadcast.thumbnailUrl || broadcast.generatedThumbnailUrl})` }
                    : {}),
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <p
                  className="text-2xl font-medium bg-black/50 text-white p-4 rounded-lg"
                  style={{ color: themeSettings.colors.text }}
                >
                  Broadcast Ended
                </p>
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
        </div>
      )}

      {broadcast && !hasEnded && (
        <div className="p-4 flex gap-8 max-w-[1700px] mx-auto">
          <div
            className="flex-1 aspect-video"
            style={{
              backgroundColor: themeSettings.colors.background,
              borderRadius: `${themeSettings.cornerRadius}px`,
              boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
              border: `1px solid ${themeSettings.colors.primary}30`,
            }}
          >
            <ReactPlayer src={broadcast.liveUrl} width="100%" height="100%" controls autoPlay />
            <div className="p-4">
              <p className="text-3xl font-medium">{broadcast.title}</p>
              <div className="flex items-center gap-6 mt-2">
                <p>20 watching now </p>
                {broadcast.startedAt && <p>Started {formatDistanceToNow(new Date(broadcast.startedAt))}</p>}
              </div>
            </div>
          </div>

          <div
            className="w-[400px]"
            style={{
              backgroundColor: themeSettings.colors.background,
              borderRadius: `${themeSettings.cornerRadius}px`,
              boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
              border: `1px solid ${themeSettings.colors.primary}30`,
            }}
          >
            <p className="text-lg p-4" style={{ borderBottom: `1px solid ${themeSettings.colors.primary}30` }}>
              Chat
            </p>
          </div>
        </div>
      )}
    </InternalPageRenderer>
  );
};
