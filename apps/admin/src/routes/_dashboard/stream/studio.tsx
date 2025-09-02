import { createFileRoute } from "@tanstack/react-router";
import { css } from "@emotion/css";

import { useEffect, useRef, useState, type JSX } from "react";

export const Route = createFileRoute("/_dashboard/stream/studio")({
  component: RouteComponent,
});

const OUTPUT_WIDTH = 1280;
const OUTPUT_HEIGHT = 720;

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

// VideoTile component: renders a video element and a name tag
function VideoTile({
  stream,
  name,
  id,
  className,
}: {
  stream: MediaStream | null;
  name: string;
  id: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (stream) {
      // Use clone to avoid track ownership issues
      el.srcObject = stream;
      const playPromise = el.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(() => {
          // Autoplay might be blocked if not muted; keep muted in demo
        });
      }
    }
  }, [stream]);

  return (
    <div
      className={`${className || ""} w-full h-full  overflow-hidden relative transition-all duration-1000`}
      data-id={id}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={"w-full h-full object-cover rounded-lg transition-all duration-300"}
      />
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

export default function RouteComponent(): JSX.Element {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputVideoRef = useRef<HTMLVideoElement | null>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [running, setRunning] = useState(false);

  // Ticker state (shared for DOM + canvas)
  const tickerText = useRef<string>("Breaking: This is a demo ticker — welcome to the show!  ");
  const tickerX = useRef<number>(0);
  const tickerSpeed = 1.5; // pixels per frame at preview scale

  // Emotion CSS styles
  const containerStyles = css`
    font-family: Inter, Roboto, system-ui;
    padding: 12px;
  `;

  const controlsStyles = css`
    margin-bottom: 12px;
  `;

  const stageWrapStyles = css`
    display: flex;
    gap: 20px;
    align-items: start;
    flex-direction: column;
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

  const rightColumnStyles = css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  `;

  const canvasPreviewStyles = css`
    width: 100%;
    aspect-ratio: 16/9;
    border-radius: 6px;
    overflow: hidden;
  `;

  const buttonWithMarginStyles = css`
    padding: 8px 12px;
    border-radius: 6px;
    background: #16a34a;
    color: #fff;
    border: none;
    cursor: pointer;
    margin-left: 8px;
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

  const hiddenCanvasStyles = css`
    display: none;
  `;

  const secondaryButtonStyles = css`
    padding: 8px 12px;
    border-radius: 6px;
    background: #0ea5e9;
    color: #fff;
    border: none;
    cursor: pointer;
  `;

  useEffect(() => {
    // Acquire camera once when component mounts
    let mounted = true;
    async function getCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
        if (!mounted) return;
        setMediaStream(s);
      } catch (err) {
        console.error("getUserMedia error:", err);
      }
    }
    getCamera();
    return () => {
      mounted = false;
      // don't stop stream here; let user keep it while page active
    };
  }, []);

  useEffect(() => {
    // initialize ticker starting x at right edge of preview
    const stageEl = stageRef.current;
    if (!stageEl) return;
    const stageRect = stageEl.getBoundingClientRect();
    tickerX.current = stageRect.width;
  }, [mediaStream]);

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
      tickerX.current -= tickerSpeed * (dt / (1000 / 60)); // normalize to 60fps baseline
      const tickerEl = stage.querySelector("[data-ticker]") as HTMLElement | null;
      const tickerWidth = tickerEl ? tickerEl.offsetWidth : 0;
      if (tickerX.current < -tickerWidth) tickerX.current = stageRect.width;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // draw a background (solid + optional image)
      ctx.fillStyle = "#0b0b0b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw each video element by reading its DOM position relative to stage
      const videos = stage.querySelectorAll("video");
      videos.forEach((video) => {
        const rect = video.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.top - stageRect.top) * scaleY;
        const w = rect.width * scaleX;
        const h = rect.height * scaleY;

        try {
          drawVideoCover(ctx, video as HTMLVideoElement, x, y, w, h);
        } catch (err) {
          console.error("drawImage error:", err);
        }
      });

      // Draw name tags (matching DOM lower-left)
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

      raf = requestAnimationFrame(drawLoop);
    }

    if (running) raf = requestAnimationFrame(drawLoop);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [running]);

  useEffect(() => {
    // Hook to pipe canvas stream to preview output video element for testing
    const canvas = canvasRef.current;
    const out = outputVideoRef.current;
    if (!canvas || !out) return;
    const s = canvas.captureStream(30);
    out.srcObject = s;
    out.play().catch(() => {});
  }, []);
  const [guestNumber, setGuestNumber] = useState(1);
  // Start/stop the composer
  async function startComposer() {
    if (!mediaStream) {
      alert("Camera not ready or permission denied");
      return;
    }

    // Assign clones: host gets original, guests get clones
    // (this simulates separate participants for the demo)
    // We won't manage audio here to keep autoplay friendly.

    // Show preview DOM videos by appending components to the stage
    // But React renders them below via mediaStream clones

    // Setup canvas resolution: 1280x720
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 1280;
    canvas.height = 720;

    setRunning(true);
  }

  function stopComposer() {
    setRunning(false);
  }

  // Demo: create cloned streams for tiles
  const hostStream = mediaStream ?? null;
  const guest1Stream = mediaStream ? mediaStream.clone() : null;

  const gridCols = !guestNumber ? 1 : Math.max(2, Math.ceil((guestNumber + 1) / 2));

  return (
    <div className={containerStyles}>
      <div className={controlsStyles}>
        <button onClick={() => setGuestNumber((g) => g + 1)} className={secondaryButtonStyles}>
          Add Guest
        </button>
        <button onClick={() => setGuestNumber((g) => g - 1)} className={secondaryButtonStyles}>
          Remove Guest
        </button>
        <button onClick={() => (running ? stopComposer() : startComposer())} className={buttonWithMarginStyles}>
          {running ? "Stop" : "Start Composer"}
        </button>
      </div>

      <div className={stageWrapStyles}>
        {/* Visible preview: CSS-controlled layout */}
        <div
          ref={stageRef}
          className={`grid grid-cols-${gridCols} gap-2 w-full aspect-[16/9] relative overflow-hidden`}
        >
          <VideoTile stream={hostStream} name="Host" id="host" />
          {Array.from({ length: guestNumber }).map((_, index) => (
            <VideoTile key={index} stream={guest1Stream} name={`Guest ${index + 1}`} id={`guest${index + 1}`} />
          ))}

          <div className={overlayTitleStyles} data-overlay-title>
            My Program Title
          </div>

          <div className={tickerStyles} data-ticker>
            {tickerText.current}
          </div>
        </div>

        <div className={rightColumnStyles}>
          <div className={previewTitleStyles}>Canvas Output Preview</div>
          <div className={canvasPreviewStyles}>
            <video ref={outputVideoRef} autoPlay muted playsInline className={videoStyles} />
          </div>
        </div>
      </div>

      {/* Hidden canvas used for broadcast capture */}
      <canvas ref={canvasRef} className={hiddenCanvasStyles} />
    </div>
  );
}
