import { useEffect, useMemo, useRef } from "react";
import { useParticipantStore } from "../store";
import { useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

export const useCanvasAudio = () => {
  const { sceneTracks } = useParticipantStore();
  const tracks = useTracks([Track.Source.Microphone]);
  const attachedStreams = useRef<MediaStream[]>([]);
  const audioContext = useRef(new AudioContext());
  const audioDestination = useRef(audioContext.current.createMediaStreamDestination());
  const audioElements = useRef<HTMLAudioElement[]>([]);
  const sceneParticipants = useMemo(() => {
    return sceneTracks.map((track) => track.participant.sid);
  }, [sceneTracks]);

  const sceneAudioTracks = useMemo(() => {
    return tracks.filter((track) => sceneParticipants.includes(track.participant.sid));
  }, [tracks, sceneParticipants]);

  useEffect(() => {
    sceneAudioTracks.forEach((track) => {
      const stream = track.publication.track?.mediaStream;
      console.log(track.publication);
      if (!stream) return;

      const exists = attachedStreams.current.find((s) => stream.id === s.id);
      if (exists) return;
      attachedStreams.current.push(stream);
      const audioElement = document.createElement("audio");
      if (track.publication.track) {
        track.publication.track.attach(audioElement);
        audioElements.current.push(audioElement);
        audioElement.volume = 0;
        if (audioElement.srcObject) {
          const source = audioContext.current.createMediaStreamSource(audioElement.srcObject as MediaStream);
          source.connect(audioDestination.current);
        }
      }
    });
  }, [sceneAudioTracks]);

  return {
    combinedAudioStream: audioDestination.current.stream,
  };
};
