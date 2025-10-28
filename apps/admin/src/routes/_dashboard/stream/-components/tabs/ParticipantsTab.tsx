import { useParticipants, useTracks, VideoTrack, type TrackReference } from "@livekit/components-react";
import { Button } from "@tribe-nest/frontend-shared";
import { Track } from "livekit-client";
import { Mic, PlusIcon, MicOff } from "lucide-react";
import { useParticipantStore } from "../store";
import { useEffect } from "react";

function ParticipantsTab() {
  const participants = useParticipants();
  const tracks = useTracks();
  const { setSceneTracks, sceneTracks } = useParticipantStore();
  const videoTracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

  useEffect(() => {
    const videosInSceneNotInVideoTracks = sceneTracks.filter(
      (t) => !videoTracks.some((v) => v.publication.trackSid === t.publication.trackSid),
    );
    if (videosInSceneNotInVideoTracks.length > 0) {
      setSceneTracks(
        sceneTracks.filter(
          (t) => !videosInSceneNotInVideoTracks.some((v) => v.publication.trackSid === t.publication.trackSid),
        ),
      );
    }
  }, [sceneTracks, videoTracks, setSceneTracks]);

  const handleAddToScene = (track: TrackReference) => {
    const exists = sceneTracks.some((t) => t.publication.trackSid === track.publication.trackSid);
    if (exists) {
      return;
    }
    setSceneTracks([...sceneTracks, track]);
  };

  const handleRemoveFromScene = (track: TrackReference) => {
    const newSceneTracks = sceneTracks.filter((t) => t.publication.trackSid !== track.publication.trackSid);
    setSceneTracks(newSceneTracks);
  };

  return (
    <div className="flex flex-col gap-6">
      {participants.map((participant) => {
        const participantTracks = tracks.filter((track) => track.participant.identity === participant.identity);
        const videoTrack = participantTracks.find((track) => track.source === Track.Source.Camera);
        const audioTrack = participantTracks.find((track) => track.source === Track.Source.Microphone);
        const screenShareVideoTrack = participantTracks.find((track) => track.source === Track.Source.ScreenShare);
        const screenShareAudioTrack = participantTracks.find((track) => track.source === Track.Source.ScreenShareAudio);
        const isInScene = sceneTracks.some((t) => t.publication.trackSid === videoTrack?.publication.trackSid);
        const isScreenShareInScene = sceneTracks.some(
          (t) => t.publication.trackSid === screenShareVideoTrack?.publication.trackSid,
        );

        return (
          <div
            key={participant.identity}
            className="flex flex-col gap-6 border border-border rounded-md p-2 items-center"
          >
            <div className="flex w-full gap-2">
              <div className="w-1/2">
                <div className="w-full aspect-video">
                  {videoTrack && videoTrack.publication.videoTrack?.isMuted === false && (
                    <VideoTrack
                      className={`${!isInScene ? "opacity-50" : ""}`}
                      trackRef={videoTrack}
                      id="video-track"
                    />
                  )}
                  {(!videoTrack || videoTrack?.publication.videoTrack?.isMuted) && (
                    <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm">Camera is off</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p>{participant.name}</p>
                {audioTrack ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                {videoTrack && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (isInScene ? handleRemoveFromScene(videoTrack) : handleAddToScene(videoTrack))}
                  >
                    {isInScene ? null : <PlusIcon />}
                    {isInScene ? "Remove" : "Add to scene"}
                  </Button>
                )}
              </div>
            </div>
            {screenShareVideoTrack && (
              <div className="flex w-full gap-2">
                <div className="w-1/2">
                  <div className="w-full aspect-video">
                    {screenShareVideoTrack && screenShareVideoTrack.publication.videoTrack?.isMuted === false && (
                      <VideoTrack
                        className={`${!isInScene ? "opacity-50" : ""}`}
                        trackRef={screenShareVideoTrack}
                        id="video-track"
                      />
                    )}
                    {(!screenShareVideoTrack || screenShareVideoTrack?.publication.videoTrack?.isMuted) && (
                      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-sm">Camera is off</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p>Screen Share</p>
                  {screenShareAudioTrack ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  {screenShareVideoTrack && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        isScreenShareInScene
                          ? handleRemoveFromScene(screenShareVideoTrack)
                          : handleAddToScene(screenShareVideoTrack)
                      }
                    >
                      {isScreenShareInScene ? null : <PlusIcon />}
                      {isScreenShareInScene ? "Remove" : "Add to scene"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ParticipantsTab;
