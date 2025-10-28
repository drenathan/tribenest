const workerCode = `
// Canvas Worker for OffscreenCanvas rendering
let offscreenCanvas;
let ctx;
let animationId;
let frameCount = 0;

self.onmessage = function (e) {
  const { type, data } = e.data;

  switch (type) {
    case "init":
      initCanvas(data.canvas);
      break;
    case "updateFrame":
      updateFrame(data);
      break;
    case "start":
      startRendering();
      break;
    case "stop":
      stopRendering();
      break;
  }
};

function initCanvas(canvas) {
  console.log("Worker: Received canvas:", {
    width: canvas.width,
    height: canvas.height,
    constructor: canvas.constructor.name
  });
  
  offscreenCanvas = canvas;
  ctx = canvas.getContext("2d");
  
  if (!ctx) {
    console.error("Worker: Could not get 2D context from OffscreenCanvas");
    return;
  }
  
  console.log("Worker: Canvas initialized", {
    width: canvas.width,
    height: canvas.height,
    hasContext: !!ctx
  });
  
  // Ensure canvas has proper dimensions
  if (canvas.width === 0 || canvas.height === 0) {
    console.error("Worker: OffscreenCanvas has zero dimensions!");
    return;
  }
  
  // Test drawing to OffscreenCanvas
  ctx.fillStyle = "blue";
  ctx.fillRect(20, 20, 80, 40);
  ctx.fillStyle = "white";
  ctx.font = "14px Arial";
  ctx.fillText("Worker", 25, 45);
  console.log("Worker: Drew test pattern to OffscreenCanvas");
  
  // Notify main thread that worker is ready
  self.postMessage({ type: "ready" });
}

function startRendering() {
  if (animationId) return;

  function render() {
    frameCount++;

    // Force frame updates for consistent streaming
    if (ctx) {
      ctx.save();
      ctx.globalAlpha = 0.001;
      ctx.fillStyle = \`hsl(\${frameCount % 360}, 100%, 50%)\`;
      ctx.fillRect(0, 0, 2, 2);
      ctx.restore();
    }

    animationId = requestAnimationFrame(render);
  }

  animationId = requestAnimationFrame(render);
  console.log("Worker: Rendering started");
}

function stopRendering() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = 0;
  }
  console.log("Worker: Rendering stopped");
}

function updateFrame(frameData) {
  if (!ctx || !offscreenCanvas) {
    console.log("Worker: No context or canvas");
    return;
  }

  console.log("Worker: Updating frame", {
    hasBackground: !!frameData.backgroundImage,
    videoCount: frameData.videos?.length || 0,
    hasTicker: !!frameData.ticker,
    overlayCount: frameData.overlays?.length || 0
  });

  // Clear canvas
  ctx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

  // Draw background
  if (frameData.backgroundImage) {
    ctx.drawImage(frameData.backgroundImage, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
  } else {
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  }

  // Draw videos
  if (frameData.videos) {
    frameData.videos.forEach((videoData) => {
      if (videoData.videoElement) {
        ctx.drawImage(videoData.videoElement, videoData.x, videoData.y, videoData.w, videoData.h);
      }
    });
  }

  // Draw ticker
  if (frameData.ticker) {
    ctx.font = "18px Inter, sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText(frameData.ticker.text, frameData.ticker.x, frameData.ticker.y);
  }

  // Draw overlays
  if (frameData.overlays) {
    frameData.overlays.forEach((overlay) => {
      drawOverlay(overlay);
    });
  }

  // Draw a test rectangle to verify rendering
  ctx.fillStyle = "red";
  ctx.fillRect(10, 10, 100, 50);
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Worker Test", 15, 35);
}

function drawOverlay(overlay) {
  switch (overlay.type) {
    case "text":
      if (overlay.data.font) ctx.font = overlay.data.font;
      if (overlay.data.color) ctx.fillStyle = overlay.data.color;
      if (overlay.data.text && overlay.data.x !== undefined && overlay.data.y !== undefined) {
        ctx.fillText(overlay.data.text, overlay.data.x, overlay.data.y);
      }
      break;
    case "rect":
      if (overlay.data.color) ctx.fillStyle = overlay.data.color;
      if (
        overlay.data.x !== undefined &&
        overlay.data.y !== undefined &&
        overlay.data.w !== undefined &&
        overlay.data.h !== undefined
      ) {
        ctx.fillRect(overlay.data.x, overlay.data.y, overlay.data.w, overlay.data.h);
      }
      break;
    // Add more overlay types as needed
  }
}
`;

// Create worker from blob
const blob = new Blob([workerCode], { type: "application/javascript" });
export const workerUrl = URL.createObjectURL(blob);
export const worker = new Worker(workerUrl);
