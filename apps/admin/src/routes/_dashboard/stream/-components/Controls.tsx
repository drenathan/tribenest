import { useRoomContext } from "@livekit/components-react";
import { useParticipantStore } from "./store";
import {
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  cn,
} from "@tribe-nest/frontend-shared";
import { Mic, MicOff, Video, VideoOff, ChevronDown, MonitorUp } from "lucide-react";
import { Track } from "livekit-client";
import { SceneLayout } from "@/types/event";

function Controls() {
  const {
    audioEnabled,
    videoEnabled,
    audioDeviceId,
    videoDeviceId,
    setAudioEnabled,
    setVideoEnabled,
    audioDevices,
    videoDevices,
    setAudioDeviceId,
    setVideoDeviceId,
  } = useParticipantStore();
  const room = useRoomContext();
  const { localTemplate, setLocalTemplate } = useParticipantStore();

  if (!localTemplate) return null;
  const selectedSceneId = localTemplate.config.selectedSceneId || localTemplate.scenes[0].id;
  const selectedScene = localTemplate.scenes.find((scene) => scene.id === selectedSceneId);

  const handleAudioDeviceChange = async (deviceId: string) => {
    setAudioDeviceId(deviceId);
    const publication = room?.localParticipant?.getTrackPublication(Track.Source.Microphone);

    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: { exact: deviceId },
      },
    });
    const audioTrack = audioStream.getAudioTracks()[0];
    if (publication?.audioTrack) {
      publication.audioTrack.replaceTrack(audioTrack);
    } else {
      await room.localParticipant.publishTrack(audioTrack, {
        name: "microphone-audio",
        source: Track.Source.Microphone,
        simulcast: false,
      });
    }
  };

  const handleVideoDeviceChange = async (deviceId: string) => {
    setVideoDeviceId(deviceId);
    const publication = room?.localParticipant?.getTrackPublication(Track.Source.Camera);
    const videoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        width: 1920,
        height: 1080,
      },
    });
    const videoTrack = videoStream.getVideoTracks()[0];
    if (publication?.videoTrack) {
      publication.videoTrack.replaceTrack(videoTrack);
    } else {
      await room.localParticipant.publishTrack(videoTrack, {
        name: "camera-video",
        source: Track.Source.Camera,
        simulcast: false,
      });
    }
  };

  const handleToggleAudio = async () => {
    if (audioEnabled) {
      room.localParticipant.setMicrophoneEnabled(false);
      const publication = room?.localParticipant?.getTrackPublication(Track.Source.Microphone);
      if (publication?.audioTrack) {
        await room.localParticipant.unpublishTrack(publication?.audioTrack);
      }
      setAudioEnabled(false);
    } else {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: audioDeviceId },
        },
      });
      const audioTrack = audioStream.getAudioTracks()[0];
      await room.localParticipant.publishTrack(audioTrack, {
        name: "microphone-audio",
        source: Track.Source.Microphone,
        simulcast: false,
      });
      room.localParticipant.setMicrophoneEnabled(true);
      setAudioEnabled(true);
    }
  };

  const handleToggleVideo = async () => {
    const publication = room?.localParticipant?.getTrackPublication(Track.Source.Camera);
    if (videoEnabled) {
      if (publication?.videoTrack) {
        await publication.videoTrack.mute();
      }

      setVideoEnabled(false);
    } else {
      if (publication?.videoTrack) {
        publication.videoTrack.unmute();
      } else {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: videoDeviceId },
            width: 1920,
            height: 1080,
          },
        });
        const videoTrack = videoStream.getVideoTracks()[0];
        await room.localParticipant.publishTrack(videoTrack, {
          name: "camera-video",
          source: Track.Source.Camera,
          simulcast: false,
        });
      }

      setVideoEnabled(true);
    }
  };

  const handleLayoutChange = (layout: SceneLayout) => {
    setLocalTemplate({
      ...localTemplate,
      scenes: localTemplate.scenes.map((scene) => (scene.id === selectedSceneId ? { ...scene, layout } : scene)),
    });
  };

  const LayoutPreview = ({
    layout,
    isSelected,
    onClick,
  }: {
    layout: SceneLayout;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    const getLayoutPreview = () => {
      switch (layout) {
        case SceneLayout.Solo:
          return (
            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
              <div className="w-full h-full bg-gray-700"></div>
            </div>
          );
        case SceneLayout.Grid:
          return (
            <div className="w-full h-full grid grid-cols-2 gap-1">
              <div className="bg-gray-700 rounded border border-border"></div>
              <div className="bg-gray-700 rounded border border-border"></div>
              <div className="bg-gray-700 rounded border border-border"></div>
              <div className="bg-gray-700 rounded border border-border"></div>
            </div>
          );
        case SceneLayout.SideBySide:
          return (
            <div className="w-full h-full flex gap-1">
              <div className="flex-1 bg-gray-700 rounded border border-border"></div>
              <div className="flex-1 bg-gray-700 rounded border border-border"></div>
            </div>
          );
        case SceneLayout.PictureInPicture:
          return (
            <div className="w-full h-full relative bg-gray-700 rounded">
              <div className="absolute bottom-1 right-1 w-1/3 h-1/3 bg-gray-700 rounded border border-grey-200"></div>
            </div>
          );
        case SceneLayout.Spotlight:
          return (
            <div className="w-full h-full grid grid-cols-2 gap-1">
              <div className="bg-gray-700 rounded border border-border"></div>
              <div className="grid grid-cols-1 gap-1">
                <div className="bg-gray-700"></div>
                <div className=" bg-gray-700"></div>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <Button
        variant="ghost"
        className={cn("p-2 h-auto flex flex-col gap-2 min-w-[80px]", isSelected && "bg-accent")}
        onClick={onClick}
      >
        <div className="w-16 h-12 rounded overflow-hidden">{getLayoutPreview()}</div>
      </Button>
    );
  };
  return (
    <div className="flex justify-center items-center gap-8 mt-4 flex-col">
      <div className="flex gap-2">
        {Object.values(SceneLayout).map((layout) => (
          <LayoutPreview
            key={layout}
            layout={layout}
            isSelected={selectedScene?.layout === layout}
            onClick={() => handleLayoutChange(layout)}
          />
        ))}
      </div>
      <Card className="flex items-center gap-4 flex-row p-4">
        {/* Audio Control */}
        <div className="flex items-center">
          <Button onClick={handleToggleAudio} variant="outline">
            {audioEnabled ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {audioDevices.map((device) => (
                <DropdownMenuItem
                  key={device.deviceId}
                  onClick={() => handleAudioDeviceChange(device.deviceId)}
                  className={audioDeviceId === device.deviceId ? "bg-accent" : ""}
                >
                  {device.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Video Control */}
        <div className="flex items-center">
          <Button onClick={handleToggleVideo} variant="outline">
            {videoEnabled ? <Video className="w-8 h-8" /> : <VideoOff className="w-8 h-8" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {videoDevices.map((device) => (
                <DropdownMenuItem
                  key={device.deviceId}
                  onClick={() => handleVideoDeviceChange(device.deviceId)}
                  className={videoDeviceId === device.deviceId ? "bg-accent" : ""}
                >
                  {device.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="ghost">
          <MonitorUp className="w-8 h-8" />{" "}
        </Button>
      </Card>
    </div>
  );
}

export default Controls;
