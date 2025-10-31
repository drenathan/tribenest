import type { TrackReference } from "@livekit/components-react";
import { VideoTile } from "./VideoTile";
import { useMainVideoTrack } from "./hooks/useMainVideoTrack";
import { useParticipantStore } from "./store";
import { SceneLayout } from "@/types/event";
import React from "react";

function VideosContainer({ tracks }: { tracks: TrackReference[] }) {
  const { localTemplate } = useParticipantStore();
  const selectedSceneId = localTemplate?.config.selectedSceneId || localTemplate?.scenes[0].id;
  const selectedScene = localTemplate?.scenes.find((scene) => scene.id === selectedSceneId);
  const currentBackground = selectedScene?.background?.url;
  const tickerText = selectedScene?.currentTickerId
    ? localTemplate?.config.tickers.find((ticker) => ticker.id === selectedScene?.currentTickerId)?.title
    : undefined;

  const isPictureInPicture = selectedScene?.layout === SceneLayout.PictureInPicture;
  const mainVideoTrack = useMainVideoTrack();

  if (!mainVideoTrack) return null;
  let bottomPadding = "0px";

  if ((!!currentBackground && tickerText) || (!currentBackground && tickerText)) {
    bottomPadding = "50px";
  } else if (!!currentBackground && !tickerText) {
    bottomPadding = "20px";
  }

  const Wrapper = isPictureInPicture ? "div" : React.Fragment;
  return (
    <>
      <VideoTile track={mainVideoTrack} id={mainVideoTrack?.publication.trackSid} />

      <Wrapper className={`absolute right-1 flex flex-wrap gap-1`} style={{ bottom: bottomPadding }}>
        {tracks
          .filter((track) => track.publication.trackSid !== mainVideoTrack.publication.trackSid)
          .map((track, index) => (
            <div key={track.publication.trackSid} className={isPictureInPicture ? "w-60 aspect-video animate-out" : ""}>
              <VideoTile key={index} track={track} id={track.publication.trackSid} isPictureInPicture={true} />
            </div>
          ))}
      </Wrapper>
    </>
  );

  //   return (
  //     <>
  //       {tracks.map((track, index) => (
  //         <VideoTile key={index} track={track} id={track.publication.trackSid} />
  //       ))}
  //     </>
  //   );
}

export default VideosContainer;
