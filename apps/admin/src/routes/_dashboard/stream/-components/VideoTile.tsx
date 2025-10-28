import { useEffect, useState } from "react";
import { type TrackReference } from "@livekit/components-react";
import { VideoTrack } from "@livekit/components-react";
import { User } from "lucide-react";
import { css } from "@emotion/css";
import { useParticipantStore } from "./store";
import { getContrastColor } from "@tribe-nest/frontend-shared";
import { COLORS } from "@/services/contants";
import { Track } from "livekit-client";

export function VideoTile({ track, id, className }: { track: TrackReference; id: string; className?: string }) {
  const [isMuted, setIsMuted] = useState(track.publication.videoTrack?.isMuted);
  const { localTemplate } = useParticipantStore();
  const selectedSceneId = localTemplate?.config.selectedSceneId || localTemplate?.scenes[0].id;
  const selectedScene = localTemplate?.scenes.find((scene) => scene.id === selectedSceneId);
  const isScreenShare = track.source === Track.Source.ScreenShare;
  const removeTitle =
    selectedScene?.currentBannerId ||
    selectedScene?.currentComment ||
    (!selectedScene?.background && selectedScene?.currentTickerId) ||
    isScreenShare;

  useEffect(() => {
    if (!track.publication.videoTrack) return;
    track.publication.videoTrack?.on("muted", () => {
      setIsMuted(true);
    });
    track.publication.videoTrack?.on("unmuted", () => {
      setIsMuted(false);
    });
  }, [track]);

  const contrastColor = getContrastColor(localTemplate?.config.primaryColor ?? COLORS.primary);

  return (
    <div
      className={`${className || ""} w-full h-full overflow-hidden relative transition-all duration-1000 ease-in-out`}
      data-id={id}
      style={{
        transitionProperty: "width, height, transform",
        transitionDuration: "1000ms",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {!isMuted && <VideoTrack trackRef={track} id="video-track" />}
      {isMuted && (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="text-center border-border">
            <User className="w-8 h-8" />
          </div>
        </div>
      )}
      {!removeTitle && (
        <div
          className={css`
            position: absolute;
            left: 8px;
            bottom: 6px;
            font-size: 16px;
          `}
        >
          <p
            data-name-tag
            style={{
              color: contrastColor,
              backgroundColor: localTemplate?.config.primaryColor ?? COLORS.primary,
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            {track.participant.name}
          </p>
          {track.participant.metadata && (
            <p
              data-title-tag
              style={{
                color: contrastColor === "#000000" ? "#FFF" : "#000",
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: contrastColor === "#000000" ? "#000" : "#FFF",
                fontSize: "12px",
              }}
            >
              {track.participant.metadata}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
