import { useEffect, useMemo, useState } from "react";
import { type TrackReference } from "@livekit/components-react";
import { VideoTrack } from "@livekit/components-react";
import { User } from "lucide-react";
import { css } from "@emotion/css";
import { useParticipantStore } from "./store";
import { getContrastColor } from "@tribe-nest/frontend-shared";
import { COLORS } from "@/services/contants";
import { Track } from "livekit-client";
import { SceneLayout } from "@/types/event";
import { useMainVideoTrack } from "./hooks/useMainVideoTrack";

export function VideoTile({
  track,
  id,
  className,
  isPictureInPicture = false,
}: {
  track: TrackReference;
  id: string;
  className?: string;
  isPictureInPicture?: boolean;
}) {
  const [isMuted, setIsMuted] = useState(track.publication.videoTrack?.isMuted);
  const { localTemplate } = useParticipantStore();
  const selectedSceneId = localTemplate?.config.selectedSceneId || localTemplate?.scenes[0].id;
  const selectedScene = localTemplate?.scenes.find((scene) => scene.id === selectedSceneId);
  const isScreenShare = track.source === Track.Source.ScreenShare;

  const mainVideoTrack = useMainVideoTrack();
  const canRender = useMemo(() => {
    const isSolo = selectedScene?.layout === SceneLayout.Solo;
    if (!isSolo) return true;
    return mainVideoTrack?.publication.trackSid === track.publication.trackSid;
  }, [selectedScene, mainVideoTrack, track.publication.trackSid]);

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

  if (!canRender) return null;
  const isMainVideo = mainVideoTrack?.publication.trackSid === track.publication.trackSid;

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
      {!isMuted && (
        <VideoTrack
          trackRef={track}
          id="video-track"
          data-object-fit={track.source === Track.Source.ScreenShare ? "contain" : "cover"}
          data-main-video={isMainVideo ? "true" : "false"}
          style={{
            background: "transparent",
          }}
        />
      )}
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
            data-font-size={isPictureInPicture ? "10" : "16"}
            style={{
              color: contrastColor,
              backgroundColor: localTemplate?.config.primaryColor ?? COLORS.primary,
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: isPictureInPicture ? "10px" : "16px",
            }}
          >
            {track.participant.name}
          </p>
          {track.participant.metadata && (
            <p
              data-title-tag
              data-font-size={isPictureInPicture ? "8" : "12"}
              style={{
                color: contrastColor === "#000000" ? "#FFF" : "#000",
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: contrastColor === "#000000" ? "#000" : "#FFF",
                fontSize: isPictureInPicture ? "8px" : "12px",
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
