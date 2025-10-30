import { useLocalParticipant } from "@livekit/components-react";
import { useParticipantStore } from "../store";
import { useMemo } from "react";

import { Track } from "livekit-client";

export const useMainVideoTrack = () => {
  const { sceneTracks } = useParticipantStore();
  const localParticipant = useLocalParticipant();
  const mainVideoTrack = useMemo(() => {
    const screenShareTrack = sceneTracks.find((track) => track.source === Track.Source.ScreenShare);
    if (screenShareTrack) return screenShareTrack;

    const cameraTrack = sceneTracks.find(
      (track) =>
        track.source === Track.Source.Camera && track.participant.sid === localParticipant.localParticipant.sid,
    );
    if (cameraTrack) return cameraTrack;

    return sceneTracks[0];
  }, [localParticipant, sceneTracks]);
  return mainVideoTrack;
};
