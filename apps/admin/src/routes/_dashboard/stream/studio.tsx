import { useAuth } from "@/hooks/useAuth";
import httpClient, { getMediaServerUrl } from "@/services/httpClient";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LocalVideoTrack, Room, Track } from "livekit-client";
import { PreJoin, RoomContext, type TrackReference } from "@livekit/components-react";
import { ControlBar } from "@livekit/components-react";
import "@livekit/components-styles";
import { VideoTrack } from "@livekit/components-react";
import { useTracks } from "@livekit/components-react";
import { css } from "@emotion/css";
import { Button, cn } from "@tribe-nest/frontend-shared";
import { io, Socket } from "socket.io-client";
import { ACCESS_TOKEN_KEY } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_dashboard/stream/studio")({
  component: RouteComponent,
});

const OUTPUT_WIDTH = 1920;
const OUTPUT_HEIGHT = 1080;

function drawVideoCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (video.videoWidth === 0 || video.videoHeight === 0) return; // not ready

  const videoAspect = video.videoWidth / video.videoHeight;
  const boxAspect = w / h;

  let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

  if (videoAspect > boxAspect) {
    // Video is wider → crop sides
    drawHeight = h;
    drawWidth = h * videoAspect;
    offsetX = (w - drawWidth) / 2;
    offsetY = 0;
  } else {
    // Video is taller → crop top/bottom
    drawWidth = w;
    drawHeight = w / videoAspect;
    offsetX = 0;
    offsetY = (h - drawHeight) / 2;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h); // clip to the box
  ctx.clip();

  ctx.drawImage(video, x + offsetX, y + offsetY, drawWidth, drawHeight);

  ctx.restore();
}

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const [room] = useState(() => new Room({}));
  const [isPrejoined, setIsPrejoined] = useState(false);

  useEffect(() => {
    if (!currentProfileAuthorization?.profileId) return;
    httpClient
      .post("/events/rooms", {}, { params: { profileId: currentProfileAuthorization?.profileId } })
      .then(({ data }) => {
        const { token } = data;
        room.connect(import.meta.env.VITE_LIVEKIT_API_URL, token);

        return () => {
          room.disconnect();
        };
      });
  }, [currentProfileAuthorization?.profileId, room]);

  return (
    <div data-lk-theme="default">
      {!isPrejoined && (
        <PreJoin
          onSubmit={(values) => {
            console.log(values);
            setIsPrejoined(true);
          }}
        />
      )}

      {isPrejoined && (
        <RoomContext.Provider value={room}>
          <Content room={room} />
        </RoomContext.Provider>
      )}
    </div>
  );
}

function VideoTile({
  track,
  name,
  id,
  className,
}: {
  track: TrackReference;
  name: string;
  id: string;
  className?: string;
}) {
  // const videoRef = useRef<HTMLVideoElement | null>(null);

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
      <VideoTrack trackRef={track} id="video-track" />
      <div
        className={css`
          position: absolute;
          left: 8px;
          bottom: 6px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
        `}
        data-name-tag
      >
        {name}
      </div>
    </div>
  );
}
const animationSpeed = 0.1;

const stageWrapStyles = css`
  display: flex;
  gap: 20px;
  align-items: start;
  flex-direction: column;
  padding: 12px;
`;

const overlayTitleStyles = css`
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 6px 12px;
  font-weight: 600;
  border-radius: 6px;
`;

const tickerStyles = css`
  position: absolute;
  bottom: 14px;
  left: 100%;
  white-space: nowrap;
  pointer-events: none;
  font-size: 18px;
  color: #fff;
  animation: ticker-scroll 10s linear infinite;

  @keyframes ticker-scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-350%);
    }
  }
`;

const canvasPreviewStyles = css`
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 6px;
  overflow: hidden;
`;

const rightColumnStyles = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const previewTitleStyles = css`
  color: #fff;
  margin-bottom: 6px;
`;

const videoStyles = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

let videoPositions = new Map<string, { x: number; y: number; w: number; h: number }>();
const Content = ({ room }: { room: Room }) => {
  const { currentProfileAuthorization } = useAuth();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputVideoRef = useRef<HTMLVideoElement | null>(null);
  const tickerText = useRef<string>("Breaking: This is a demo ticker — welcome to the show!  ");
  const tickerX = useRef<number>(0);
  const tickerSpeed = 1.5; // pixels per frame at preview scale
  const [currentBackground] = useState<string | null>("https://studio.restream.io/backgrounds/2025/9_purple_pink.jpg");
  const [overlayImageUrl] = useState<string | null>(
    "https://studio-assets.restream.io/defaults/overlays/2025/3_breaking_news.png",
  );
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null);
  const [isOverlayLoaded, setIsOverlayLoaded] = useState(false);
  const canvasStream = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Helper function for smooth interpolation
  const lerp = (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  };

  const cameraTracks = useTracks([Track.Source.Camera]);

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

  // Load background image
  useEffect(() => {
    if (!overlayImageUrl) {
      setOverlayImage(null);
      setIsOverlayLoaded(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable CORS for external images
    img.onload = () => {
      setOverlayImage(img);
      setIsOverlayLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load background image:", overlayImageUrl);
      setOverlayImage(null);
      setIsOverlayLoaded(false);
    };
    img.src = overlayImageUrl;
  }, [overlayImageUrl]);

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
    let raf = 0;
    let lastTs = performance.now();

    // canvas composition loop
    function drawLoop(ts: number) {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!canvas || !stage) {
        raf = requestAnimationFrame(drawLoop);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const stageRect = stage.getBoundingClientRect();
      const scaleX = OUTPUT_WIDTH / stageRect.width;
      const scaleY = OUTPUT_HEIGHT / stageRect.height;

      // delta time
      const dt = Math.min(50, ts - lastTs);
      lastTs = ts;

      // update ticker position in preview-space pixels
      tickerX.current -= tickerSpeed * (dt / (1000 / 30)); // normalize to 60fps baseline
      const tickerEl = stage.querySelector("[data-ticker]") as HTMLElement | null;
      const tickerWidth = tickerEl ? tickerEl.offsetWidth : 0;
      if (tickerX.current < -tickerWidth) tickerX.current = stageRect.width;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background image or solid color
      if (backgroundImage && isBackgroundLoaded) {
        // Draw background image to cover the entire canvas
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      } else {
        // Fallback to solid background color
        ctx.fillStyle = "#0b0b0b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw each video element with smooth animation
      const videos = stage.querySelectorAll("video");
      const newTargetPositions = new Map<string, { x: number; y: number; w: number; h: number }>();
      const newVideoPositions = new Map<string, { x: number; y: number; w: number; h: number }>();

      videos.forEach((video, index) => {
        const rect = video.getBoundingClientRect();
        const videoId = `video-${index}`;
        const targetX = (rect.left - stageRect.left) * scaleX;
        const targetY = (rect.top - stageRect.top) * scaleY;
        const targetW = rect.width * scaleX;
        const targetH = rect.height * scaleY;

        newTargetPositions.set(videoId, { x: targetX, y: targetY, w: targetW, h: targetH });

        // Get current animated position or use target if not set
        const currentPos = videoPositions.get(videoId) || { x: targetX, y: targetY, w: targetW, h: targetH };
        const targetPos = newTargetPositions.get(videoId)!;

        // Interpolate towards target position
        const animatedX = lerp(currentPos.x, targetPos.x, animationSpeed);
        const animatedY = lerp(currentPos.y, targetPos.y, animationSpeed);
        const animatedW = lerp(currentPos.w, targetPos.w, animationSpeed);
        const animatedH = lerp(currentPos.h, targetPos.h, animationSpeed);

        // Store animated position for next frame
        newVideoPositions.set(videoId, { x: animatedX, y: animatedY, w: animatedW, h: animatedH });

        try {
          drawVideoCover(ctx, video as HTMLVideoElement, animatedX, animatedY, animatedW, animatedH);
        } catch (err) {
          console.error("drawImage error:", err);
        }
      });

      // Update positions for next frame
      videoPositions = newVideoPositions;

      // Draw name tags with smooth animation (matching video positions)
      const tags = stage.querySelectorAll("[data-name-tag]");
      ctx.textBaseline = "alphabetic";
      tags.forEach((tag) => {
        const rect = tag.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.bottom - stageRect.top) * scaleY; // bottom baseline
        const fontSize = 14 * scaleY;
        ctx.font = `${fontSize}px Inter, sans-serif`;
        // background rectangle for readability
        const padding = 6 * scaleY;
        const text = tag.textContent || "";
        const metrics = ctx.measureText(text);
        const textW = metrics.width;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(x - 4 * scaleX, y - fontSize - 6 * scaleY, textW + padding, fontSize + 6 * scaleY);
        ctx.fillStyle = "white";
        ctx.fillText(text, x, y - 4 * scaleY);
      });

      // Draw program title centered at top
      const titleEl = stage.querySelector("[data-overlay-title]") as HTMLElement | null;
      if (titleEl) {
        const rect = titleEl.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.bottom - stageRect.top) * scaleY;
        const fontSize = 20 * scaleY;
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        const txt = titleEl.textContent || "";
        const metrics = ctx.measureText(txt);
        ctx.fillRect(x - 8 * scaleX, y - fontSize - 8 * scaleY, metrics.width + 16 * scaleX, fontSize + 12 * scaleY);
        ctx.fillStyle = "white";
        ctx.fillText(txt, x, y - 6 * scaleY);
      }

      // Draw ticker (marquee) using shared tickerX (preview space)
      ctx.font = `${18 * scaleY}px Inter, sans-serif`;
      ctx.fillStyle = "white";
      const tickerY = (stageRect.height - 14) * scaleY;
      ctx.fillText(tickerText.current, tickerX.current * scaleX, tickerY);

      if (overlayImage && isOverlayLoaded) {
        ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
      }
      raf = requestAnimationFrame(drawLoop);
    }
    raf = requestAnimationFrame(drawLoop);
    // const interval = setInterval(() => {
    //   drawLoop(performance.now());
    // }, 1000 / 30);

    return () => {
      cancelAnimationFrame(raf);
      // clearInterval(interval);
    };
  }, [backgroundImage, isBackgroundLoaded, overlayImage, isOverlayLoaded]);

  // Calculate grid columns based on layout mode
  const getGridCols = () => {
    return !cameraTracks.length || cameraTracks.length === 1
      ? 1
      : Math.max(2, Math.ceil((cameraTracks.length + 1) / 2));
  };

  const gridCols = getGridCols();

  const handleGoLive = async () => {
    if (!canvasStream.current) return;
    const stream = canvasStream.current;
    console.log(stream);
    const videoTracks = stream.getVideoTracks();
    if (!videoTracks.length) {
      return;
    }

    const { data } = await httpClient.post("/events/go-live");
    const room = new Room({});
    await room.connect(import.meta.env.VITE_LIVEKIT_API_URL, data.token);

    const localTrack = new LocalVideoTrack(videoTracks[0], {
      width: OUTPUT_WIDTH,
      height: OUTPUT_HEIGHT,
      frameRate: 30,
      aspectRatio: 16 / 9,
    });

    await room.localParticipant.publishTrack(localTrack, {
      name: "egress-video",
      source: Track.Source.Camera,
      simulcast: false,
    });

    // room.on("trackPublished", (publication) => {
    //   console.log(publication);
    // });
    // room.on("connected", () => {
    //   console.log("room connected");

    // });

    await httpClient.post("/events/start-egress");
  };
  // const handleGoLive = async () => {
  //   if (!socketRef.current || !canvasRef.current) return;

  //   const stream = canvasRef.current.captureStream(30);

  //   const mediaRecorder = new MediaRecorder(stream, {
  //     mimeType: "video/webm",
  //     // audioBitsPerSecond: 128000,
  //     videoBitsPerSecond: 6_000_000,
  //   });

  //   mediaRecorder.start(1000);

  //   mediaRecorder.ondataavailable = (event) => {
  //     console.log("dataavailable", event.data);
  //     socketRef.current?.emit("binaryStream", event.data);
  //   };

  //   mediaRecorder.onstop = () => {
  //     console.log("mediaRecorder stopped");
  //   };

  //   mediaRecorder.onerror = (event) => {
  //     console.error("mediaRecorder error", event);
  //   };

  //   // navigator.mediaDevices
  //   //   .getUserMedia({
  //   //     video: {
  //   //       width: 1920,
  //   //       height: 1080,
  //   //       frameRate: 30,
  //   //     },
  //   //     audio: true,
  //   //   })
  //   //   .then((stream) => {
  //   //     const mediaRecorder = new MediaRecorder(stream, {});

  //   //     mediaRecorder.start(1000);

  //   //     mediaRecorder.ondataavailable = (event) => {
  //   //       console.log("dataavailable", event.data);
  //   //       socketRef.current?.emit("binaryStream", event.data);
  //   //     };

  //   //     mediaRecorder.onstop = () => {
  //   //       console.log("mediaRecorder stopped");
  //   //     };

  //   //     mediaRecorder.onerror = (event) => {
  //   //       console.error("mediaRecorder error", event);
  //   //     };
  //   //   });
  // };
  const handleAddCanvasVideo = async () => {
    if (!canvasStream.current) return;
    const stream = canvasStream.current;

    const videoTracks = stream.getVideoTracks();
    if (!videoTracks.length) {
      return;
    }

    videoTracks[0].contentHint = "motion";

    const localTrack = new LocalVideoTrack(videoTracks[0], {
      width: OUTPUT_WIDTH,
      height: OUTPUT_HEIGHT,
      frameRate: 30,
      aspectRatio: 16 / 9,
    });

    room.localParticipant.publishTrack(localTrack, {
      name: "egress-video1",
      source: Track.Source.Camera,
      videoEncoding: {
        maxBitrate: 2500_000, // 2.5 Mbps
        maxFramerate: 30,
      },
    });

    // room.localParticipant.publishTrack(localTrack, {
    //   name: "egress-video2",
    //   source: Track.Source.Camera,
    //   videoEncoding: {
    //     maxBitrate: 2500_000, // 2.5 Mbps
    //     maxFramerate: 30,
    //   },
    // });
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 z-[100000] bg-background">
        <div className="flex gap-2 flex-wrap items-center">
          <Button onClick={() => setIsOverlayLoaded(!isOverlayLoaded)}>Toggle Overlay</Button>
          <Button onClick={() => setIsBackgroundLoaded(!isBackgroundLoaded)}>Toggle Background</Button>
          <Button onClick={handleGoLive}>Go Live</Button>
          <Button onClick={handleAddCanvasVideo}>Add Canvas Video</Button>
        </div>
      </header>

      <div className="flex">
        <div className="w-[200px] border-r border-border shrink-0 h-vh"></div>

        <div className={stageWrapStyles}>
          {/* Visible preview: CSS-controlled layout */}
          <div className={rightColumnStyles}>
            <div className={previewTitleStyles}>Canvas Output Preview</div>
            <div className={canvasPreviewStyles}>
              <video ref={outputVideoRef} autoPlay muted playsInline className={videoStyles} />
            </div>
          </div>
          <div
            style={{
              backgroundImage: isBackgroundLoaded ? `url(${currentBackground})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "top",
              backgroundRepeat: "no-repeat",
            }}
            ref={stageRef}
            className={cn(`grid grid-cols-${gridCols} gap-2 w-full aspect-[16/9] relative overflow-hidden flex-1`, {
              "p-4": !!isBackgroundLoaded,
            })}
          >
            {overlayImage && isOverlayLoaded && (
              <img src={overlayImage.src} alt="Overlay" className="absolute top-0 left-0 w-full h-full z-50" />
            )}

            {cameraTracks.map((track, index) => (
              <VideoTile key={index} track={track} name={`Guest ${index + 1}`} id={`guest${index + 1}`} />
            ))}

            <div className={overlayTitleStyles} data-overlay-title>
              My Program Title
            </div>

            <div className={tickerStyles} data-ticker>
              {tickerText.current}
            </div>
          </div>
          <ControlBar />
        </div>

        <div className="w-[200px] border-l border-border shrink-0 h-vh"></div>
      </div>
      <canvas width={OUTPUT_WIDTH} height={OUTPUT_HEIGHT} ref={canvasRef} className="hidden" />
    </>
  );
};
