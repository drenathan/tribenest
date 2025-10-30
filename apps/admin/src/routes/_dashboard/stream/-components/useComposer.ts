import "hacktimer";
import { COLORS } from "@/services/contants";
import type { IStreamTemplate } from "@/types/event";
import { FontFamily, getContrastColor } from "@tribe-nest/frontend-shared";
import { useEffect } from "react";

export const OUTPUT_WIDTH = 1920;
export const OUTPUT_HEIGHT = 1080;

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
export const useComposer = ({
  canvasRef,
  stageRef,
  template,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  stageRef: React.RefObject<HTMLDivElement | null>;
  template: IStreamTemplate | null;
}) => {
  useEffect(() => {
    // let raf = 0;
    if (!template) return;
    const contrastColor = getContrastColor(template.config.primaryColor ?? COLORS.primary);
    const fontFamily = template.config.fontFamily ?? FontFamily.Inter;
    const secondaryColor = contrastColor === "#000000" ? "#FFFFFF" : "#000000";
    const secondaryBackgroundColor = contrastColor === "#000000" ? "#000000" : "#FFFFFF";
    // canvas composition loop
    function drawLoop(template: IStreamTemplate) {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!canvas || !stage) {
        // raf = requestAnimationFrame(drawLoop);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const stageRect = stage.getBoundingClientRect();
      const scaleX = OUTPUT_WIDTH / stageRect.width;
      const scaleY = OUTPUT_HEIGHT / stageRect.height;
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // // Draw background image or solid color
      // if (backgroundImage && isBackgroundLoaded) {
      //   // Draw background image to cover the entire canvas
      //   ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      // } else {
      //   // Fallback to solid background color
      //   ctx.fillStyle = "#0b0b0b";
      //   ctx.fillRect(0, 0, canvas.width, canvas.height);
      // }

      const backgroundImage = stage.querySelector("[data-background-image]");
      if (backgroundImage) {
        const rect = backgroundImage.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.top - stageRect.top) * scaleY;
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;
        ctx.drawImage(backgroundImage as HTMLImageElement, x, y, width, height);
      } else {
        ctx.fillStyle = "#0b0b0b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw each video element with smooth animation
      const videos = stage.querySelectorAll("video");

      videos.forEach((video) => {
        const rect = video.getBoundingClientRect();
        const targetX = (rect.left - stageRect.left) * scaleX;
        const targetY = (rect.top - stageRect.top) * scaleY;
        const targetW = rect.width * scaleX;
        const targetH = rect.height * scaleY;

        try {
          drawVideoCover(ctx, video as HTMLVideoElement, targetX, targetY, targetW, targetH);
        } catch (err) {
          console.error("drawImage error:", err);
        }
      });

      // Draw name tags with smooth animation (matching video positions)
      const tags = stage.querySelectorAll("[data-name-tag]");
      ctx.textBaseline = "alphabetic";
      tags.forEach((tag) => {
        const rect = tag.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.top - stageRect.top) * scaleY; // bottom baseline
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;
        const fontSize = 16 * scaleY;
        ctx.font = `${fontSize}px ${fontFamily}`;
        // background rectangle for readability
        const paddingY = 6 * scaleY;
        const paddingX = 6 * scaleX;
        const text = tag.textContent || "";
        const borderRadius = 4;
        ctx.fillStyle = template.config.primaryColor ?? COLORS.primary;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, borderRadius);
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = contrastColor;
        ctx.fillText(text, x + paddingX, y + paddingY + fontSize);
      });

      const titleTags = stage.querySelectorAll("[data-title-tag]");
      titleTags.forEach((tag) => {
        const rect = tag.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.top - stageRect.top) * scaleY; // bottom baseline
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;
        const fontSize = 12 * scaleY;
        ctx.font = `${fontSize}px ${fontFamily}`;
        const paddingY = 6 * scaleY;
        const paddingX = 6 * scaleX;
        const text = tag.textContent || "";
        const borderRadius = 4;
        ctx.fillStyle = secondaryBackgroundColor;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, borderRadius);
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = secondaryColor;
        ctx.fillText(text, x + paddingX, y + paddingY + fontSize);
      });

      const bannerTitle = stage.querySelector("[data-banner-title]");
      if (bannerTitle) {
        const rect = bannerTitle.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.top - stageRect.top) * scaleY; // bottom baseline
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;
        const fontSize = 24 * scaleY;
        ctx.font = `${fontSize}px ${fontFamily}`;
        const paddingY = 10 * scaleY;
        const paddingX = 24 * scaleX;
        const text = bannerTitle.textContent || "";
        const borderRadius = 4;
        ctx.fillStyle = template.config.primaryColor ?? COLORS.primary;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, borderRadius);
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = contrastColor;
        ctx.fillText(text, x + paddingX, y + paddingY + fontSize);
      }

      const bannerSubtitle = stage.querySelector("[data-banner-subtitle]");
      if (bannerSubtitle) {
        const rect = bannerSubtitle.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.top - stageRect.top) * scaleY; // bottom baseline
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;
        const fontSize = 18 * scaleY;
        ctx.font = `${fontSize}px ${fontFamily}`;
        const paddingY = 4 * scaleY;
        const paddingX = 24 * scaleX;
        const text = bannerSubtitle.textContent || "";
        const borderRadius = 4;
        ctx.fillStyle = secondaryBackgroundColor;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, borderRadius);
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = secondaryColor;
        ctx.fillText(text, x + paddingX, y + paddingY + fontSize);
      }
      const commentName = stage.querySelector("[data-comment-name]");
      if (commentName) {
        const rect = commentName.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.top - stageRect.top) * scaleY; // bottom baseline
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;
        const fontSize = 18 * scaleY;
        ctx.font = `${fontSize}px ${fontFamily}`;
        const paddingY = 10 * scaleY;
        const paddingX = 12 * scaleX;
        const text = commentName.textContent || "";
        const borderRadius = 4;
        ctx.fillStyle = template.config.primaryColor ?? COLORS.primary;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, borderRadius);
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = contrastColor;
        ctx.fillText(text, x + paddingX, y + paddingY + fontSize);
      }

      const commentContent = stage.querySelector("[data-comment-content]");
      if (commentContent) {
        const rect = commentContent.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.top - stageRect.top) * scaleY; // bottom baseline
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;
        const fontSize = 24 * scaleY;
        ctx.font = `${fontSize}px ${fontFamily}`;
        const paddingY = 10 * scaleY;
        const paddingX = 12 * scaleX;
        const text = commentContent.textContent || "";
        const borderRadius = 4;
        ctx.fillStyle = secondaryBackgroundColor;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, borderRadius);
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = secondaryColor;
        ctx.fillText(text, x + paddingX, y + paddingY + fontSize);
      }

      const tickerContainer = stage.querySelector("[data-ticker-container]");

      if (tickerContainer) {
        const rect = tickerContainer.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.top - stageRect.top) * scaleY; // bottom baseline
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;
        const borderRadius = 4;
        ctx.fillStyle = template.config.primaryColor ?? COLORS.primary;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, borderRadius);
        ctx.fill();
        ctx.closePath();
      }
      const tickerText = stage.querySelector("[data-ticker-text]");
      if (tickerText) {
        const rect = tickerText.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.top - stageRect.top) * scaleY; //
        const fontSize = 18 * scaleY;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = contrastColor;
        const text = tickerText.textContent || "";
        ctx.fillText(text, x, y + fontSize);
      }

      const overlay = stage.querySelector("[data-overlay]");
      if (overlay) {
        const rect = overlay.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.top - stageRect.top) * scaleY;
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;
        ctx.drawImage(overlay as HTMLImageElement, x, y, width, height);
      }

      const logo = stage.querySelector("[data-logo]");
      if (logo) {
        const rect = logo.getBoundingClientRect();
        const x = (rect.left - stageRect.left) * scaleX;
        const y = (rect.top - stageRect.top) * scaleY;
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;
        ctx.drawImage(logo as HTMLImageElement, x, y, width, height);
      }
      // raf = requestAnimationFrame(drawLoop);
    }
    // raf = requestAnimationFrame(drawLoop);
    const interval = setInterval(() => {
      drawLoop(template);
    }, 1000 / 30);

    return () => {
      // cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, [template, canvasRef, stageRef]);
};
