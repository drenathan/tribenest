import { useEffect, useMemo, useRef } from "react";
import { useParticipantStore } from "../store";
import { useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

export const useCanvasAudio = () => {
  const { sceneTracks } = useParticipantStore();
  const tracks = useTracks([Track.Source.Microphone, Track.Source.ScreenShareAudio]);
  const attachedStreams = useRef<MediaStream[]>([]);
  const audioContext = useRef(new AudioContext());
  const audioDestination = useRef(audioContext.current.createMediaStreamDestination());
  const audioElements = useRef<HTMLAudioElement[]>([]);

  const sceneAudioTracks = useMemo(() => {
    return tracks.filter((track) => {
      if (track.source === Track.Source.ScreenShareAudio) {
        const screenShareForParticipant = sceneTracks.find(
          (t) => t.participant.sid === track.participant.sid && t.source === Track.Source.ScreenShare,
        );
        return screenShareForParticipant !== undefined;
      } else {
        const cameraForParticipant = sceneTracks.find(
          (t) => t.participant.sid === track.participant.sid && t.source === Track.Source.Camera,
        );
        return cameraForParticipant !== undefined;
      }
    });
  }, [tracks, sceneTracks]);

  useEffect(() => {
    sceneAudioTracks.forEach((track) => {
      const stream = track.publication.track?.mediaStream;
      if (!stream) return;

      const exists = attachedStreams.current.find((s) => stream.id === s.id);
      if (exists) return;
      attachedStreams.current.push(stream);
      const audioElement = document.createElement("audio");
      if (track.publication.track) {
        track.publication.track.attach(audioElement);
        audioElements.current.push(audioElement);

        if (audioElement.srcObject) {
          const source = audioContext.current.createMediaStreamSource(audioElement.srcObject as MediaStream);
          source.connect(audioDestination.current);
          audioElement.volume = 0;
        }
      }
    });
  }, [sceneAudioTracks]);

  return {
    combinedAudioStream: audioDestination.current.stream,
  };
};
