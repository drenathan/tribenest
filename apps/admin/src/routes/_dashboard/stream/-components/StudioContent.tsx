import "hacktimer";
import { useAuth } from "@/hooks/useAuth";
import httpClient, { getMediaServerUrl } from "@/services/httpClient";
import { useEffect, useRef, useState } from "react";
import { LocalTrackPublication, Room, Track, VideoPresets } from "livekit-client";
import { useRoomContext, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { Button, cn, FontFamily, getContrastColor, sleep, Tooltip2 } from "@tribe-nest/frontend-shared";
import { io, Socket } from "socket.io-client";
import { ACCESS_TOKEN_KEY } from "@/contexts/AuthContext";

import { useParticipantStore } from "./store";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import Scenes from "./Scenes";
import { OUTPUT_HEIGHT, OUTPUT_WIDTH, useComposer } from "./useComposer";
import RightPanel from "./RightPanel";
import Controls from "./Controls";
import { VideoTile } from "./VideoTile";
import { COLORS } from "@/services/contants";
import { useCanvasAudio } from "./hooks/useCanvasAudio";

export const StudioContent = () => {
  const { currentProfileAuthorization } = useAuth();
  const room = useRoomContext();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const canvasStream = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const { videoDeviceId, videoEnabled, sceneTracks, localTemplate } = useParticipantStore();
  const localVideoTrackRef = useRef<LocalTrackPublication | null>(null);
  const { combinedAudioStream } = useCanvasAudio();
  const isDefaultVideoInitiated = useRef(false);
  const selectedSceneId = localTemplate?.config.selectedSceneId || localTemplate?.scenes[0].id;
  const selectedScene = localTemplate?.scenes.find((scene) => scene.id === selectedSceneId);
  const currentBackground = selectedScene?.background?.url;
  const overlayImageUrl = selectedScene?.overlay?.url;
  const tickerText = selectedScene?.currentTickerId
    ? localTemplate?.config.tickers.find((ticker) => ticker.id === selectedScene?.currentTickerId)?.title
    : undefined;
  const currentBanner = selectedScene?.currentBannerId
    ? localTemplate?.config.banners.find((banner) => banner.id === selectedScene?.currentBannerId)
    : undefined;
  const contrastColor = getContrastColor(localTemplate?.config.primaryColor ?? COLORS.primary);

  useComposer({
    canvasRef,
    stageRef,
    backgroundImage,
    isBackgroundLoaded,
    template: localTemplate,
  });

  const cameraTracks = sceneTracks;

  useEffect(() => {
    if (!currentProfileAuthorization?.profileId) return;

    const socket = io(getMediaServerUrl(), {
      auth: {
        token: localStorage.getItem(ACCESS_TOKEN_KEY),
        profileId: currentProfileAuthorization?.profileId,
      },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("connected to media server");
    });

    socket.on("connect_error", (error) => {
      console.error("error connecting to media server", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentProfileAuthorization?.profileId]);

  useEffect(() => {
    // Hook to pipe canvas stream to preview output video element for testing
    const canvas = canvasRef.current;
    const out = outputVideoRef.current;
    if (!canvas || !out) return;
    const s = canvas.captureStream(30);
    canvasStream.current = s;
    outputVideoRef.current!.srcObject = s;
    outputVideoRef.current!.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentBackground) {
      setBackgroundImage(null);
      setIsBackgroundLoaded(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable CORS for external images
    img.onload = () => {
      setBackgroundImage(img);
      setIsBackgroundLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load background image:", currentBackground);
      setBackgroundImage(null);
      setIsBackgroundLoaded(false);
    };
    img.src = currentBackground;
  }, [currentBackground]);

  useEffect(() => {
    const processStreams = async () => {
      if (!room) return;

      if (isDefaultVideoInitiated.current) return;
      isDefaultVideoInitiated.current = true;

      if (videoEnabled && videoDeviceId) {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: videoDeviceId,
          },
        });
        const videoTrack = videoStream.getVideoTracks()[0];

        if (localVideoTrackRef.current?.videoTrack) {
          room.localParticipant.unpublishTrack(localVideoTrackRef.current.videoTrack);
          localVideoTrackRef.current = null;
        }

        const publication = await room.localParticipant.publishTrack(videoTrack, {
          name: "camera-video",
          source: Track.Source.Camera,
          simulcast: false,
        });

        localVideoTrackRef.current = publication;
        room.localParticipant.setCameraEnabled(true);
      } else {
        if (localVideoTrackRef.current?.videoTrack) {
          room.localParticipant.unpublishTrack(localVideoTrackRef.current.videoTrack);
          localVideoTrackRef.current = null;
        }
      }
    };
    processStreams();
  }, [room, videoEnabled, videoDeviceId]);

  const tickerContainerRef = useRef<HTMLDivElement>(null);
  const tickerTextRef = useRef<HTMLDivElement>(null);
  const [tickerSpeed] = useState(2.5);

  useEffect(() => {
    if (!tickerText || !tickerContainerRef.current || !tickerTextRef.current) return;

    const container = tickerContainerRef.current;
    const textElement = tickerTextRef.current;

    // Initialize position to start from the right side
    const containerWidth = container.offsetWidth;
    const frameRate = 30; // 30 FPS
    const intervalTime = 1000 / frameRate;
    let position = containerWidth;

    const animateTicker = () => {
      const textWidth = textElement.offsetWidth;

      if (position < -textWidth) {
        position = containerWidth;
      } else {
        position -= tickerSpeed;
      }

      // Direct DOM manipulation - no re-renders!
      textElement.style.transform = `translateX(${position}px)`;
    };

    const intervalId = setInterval(animateTicker, intervalTime);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [tickerText, tickerSpeed]);

  // Calculate grid columns based on layout mode
  const getGridCols = () => {
    return !cameraTracks.length || cameraTracks.length === 1
      ? 1
      : Math.max(2, Math.ceil((cameraTracks.length + 1) / 2));
  };

  const gridCols = getGridCols();

  const handleStopLive = async () => {
    if (!isLive) return;
    try {
      setIsLoadingLive(true);
      await httpClient.post("/events/stop-egress");
      setIsLive(false);
      setIsLoadingLive(false);
    } catch (error) {
      console.error("error stopping live", error);
      setIsLoadingLive(false);
    }
  };

  const handleGoLive = async () => {
    try {
      setIsLoadingLive(true);
      if (!canvasRef.current) return;
      const stream = canvasRef.current.captureStream(30);

      const videoTracks = stream.getVideoTracks();
      if (!videoTracks.length) {
        return;
      }

      const { data } = await httpClient.post("/events/go-live");
      const room = new Room({
        videoCaptureDefaults: {
          resolution: VideoPresets.h1080.resolution,
        },
        publishDefaults: {
          videoEncoding: VideoPresets.h1080.encoding,
        },
      });
      await room.connect(import.meta.env.VITE_LIVEKIT_API_URL, data.token);

      await room.localParticipant.publishTrack(videoTracks[0], {
        name: "egress-video",
        source: Track.Source.Camera,
        simulcast: false,
      });

      await room.localParticipant.publishTrack(combinedAudioStream.getAudioTracks()[0], {
        name: "egress-audio",
        source: Track.Source.Microphone,
        simulcast: false,
      });

      await sleep(1000);

      await httpClient.post("/events/start-egress");
      setIsLive(true);
      setIsLoadingLive(false);
    } catch (error) {
      console.error("error going live", error);
      setIsLoadingLive(false);
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 z-[100000] bg-background">
        <div className="flex items-center gap-2">
          <Tooltip2 text="Back">
            <Button variant="outline" size="icon" onClick={() => navigate({ to: "/stream/list" })}>
              <ArrowLeftIcon className="w-4 h-4 text-foreground" />
            </Button>
          </Tooltip2>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Button onClick={isLive ? handleStopLive : handleGoLive} disabled={isLoadingLive}>
            {isLive ? "Stop Live" : "Go Live"}
          </Button>
        </div>
      </header>

      <div className="flex">
        <Scenes />
        <RoomAudioRenderer />
        <div className="flex-1 p-4 flex flex-col  items-center">
          {/* Visible preview: CSS-controlled layout */}
          {/* <div>
            <div>
              <video
                ref={outputVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full aspect-video bg-gray-900 object-cover"
              />
            </div>
          </div> */}
          <div
            style={{
              backgroundImage: isBackgroundLoaded ? `url(${currentBackground})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "top",
              backgroundRepeat: "no-repeat",
              backgroundColor: isBackgroundLoaded ? "transparent" : "#0b0b0b",
              fontFamily: localTemplate?.config.fontFamily ?? FontFamily.Inter,
            }}
            ref={stageRef}
            className={cn(`grid grid-cols-${gridCols} gap-2 w-full max-w-6xl aspect-[16/9] relative overflow-hidden`, {
              "p-10": !!isBackgroundLoaded && tickerText,
              "p-4": !!isBackgroundLoaded && !tickerText,
            })}
          >
            {overlayImageUrl && (
              <img
                src={overlayImageUrl}
                alt="Overlay"
                crossOrigin="anonymous"
                data-overlay
                className="absolute top-0 left-0 w-full h-full z-50"
              />
            )}

            {cameraTracks.map((track, index) => (
              <VideoTile key={index} track={track} id={track.publication.trackSid} />
            ))}

            {selectedScene?.logo && (
              <img
                data-logo
                src={selectedScene.logo.url}
                crossOrigin="anonymous"
                alt="Logo"
                className="absolute top-8 right-10 w-10 h-10 z-50 object-cover"
              />
            )}

            {currentBanner && (
              <div
                style={{
                  position: "absolute",
                  bottom: tickerText ? "60px" : "10px",
                  left: "30px",
                }}
              >
                <p
                  style={{
                    color: contrastColor,
                    backgroundColor: localTemplate?.config.primaryColor,
                    padding: "10px 24px",
                    borderRadius: "4px",
                    fontSize: "24px",
                  }}
                  data-banner-title
                >
                  {currentBanner.title}
                </p>
                {currentBanner.subtitle && (
                  <p
                    data-banner-subtitle
                    style={{
                      color: contrastColor === "#000000" ? "#FFFFFF" : "#000000",
                      backgroundColor: contrastColor === "#000000" ? "#000000" : "#FFFFFF",
                      padding: "4px 24px",
                      borderRadius: "4px",
                      fontSize: "18px",
                      display: "inline-block",
                    }}
                  >
                    {currentBanner.subtitle}
                  </p>
                )}
              </div>
            )}

            {tickerText && (
              <div
                ref={tickerContainerRef}
                data-ticker-container
                style={{
                  backgroundColor: localTemplate?.config.primaryColor,
                  position: "absolute",
                  bottom: "0px",
                  width: "100%",
                  height: "40px",
                  left: "0px",
                  display: "flex",
                  alignItems: "center",
                  color: contrastColor,
                  fontSize: "18px",
                  overflow: "hidden",
                }}
              >
                <div
                  className="whitespace-nowrap pointer-events-none"
                  data-ticker-text
                  style={{ position: "absolute" }}
                  ref={tickerTextRef}
                >
                  {tickerText}
                </div>
              </div>
            )}
          </div>

          <Controls />
        </div>
        <RightPanel />
      </div>
      <canvas width={OUTPUT_WIDTH} height={OUTPUT_HEIGHT} ref={canvasRef} className="hidden" />
    </>
  );
};
