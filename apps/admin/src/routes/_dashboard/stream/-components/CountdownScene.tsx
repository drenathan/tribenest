import { useEffect, useState, useRef } from "react";
import { SceneType } from "@/types/event";
import { useParticipantStore } from "./store";
import {
  FontFamily,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  cn,
} from "@tribe-nest/frontend-shared";
import { ChevronDown } from "lucide-react";
import { FONT_OPTIONS } from "@/services/contants";

function CountdownScene() {
  const { localTemplate, setLocalTemplate } = useParticipantStore();
  const selectedSceneId = localTemplate?.config.selectedSceneId || localTemplate?.scenes[0].id;
  const selectedScene = localTemplate?.scenes.find((scene) => scene.id === selectedSceneId);
  const countdown = selectedScene?.countdown;

  const [remainingSeconds, setRemainingSeconds] = useState<number>(countdown?.duration || 0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousSceneIdRef = useRef<string | undefined>(selectedSceneId);
  const controlBarRef = useRef<HTMLDivElement>(null);

  // Reset countdown when scene changes or duration changes
  useEffect(() => {
    if (previousSceneIdRef.current !== selectedSceneId && countdown?.duration) {
      setRemainingSeconds(countdown.duration);
      previousSceneIdRef.current = selectedSceneId;
    }
  }, [selectedSceneId, countdown?.duration]);

  // Start/reset countdown when component mounts or duration changes
  useEffect(() => {
    if (!countdown?.duration) return;

    // Reset to new duration
    setRemainingSeconds(countdown.duration);

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start countdown
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [countdown?.duration, selectedSceneId]);

  if (selectedScene?.type !== SceneType.Countdown) return null;
  if (!countdown) return null;

  // Format seconds as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const color = countdown.color || "#FFFFFF";
  const fontFamily = countdown.fontFamily || localTemplate?.config.fontFamily || FontFamily.Inter;

  const handleDurationChange = (newDuration: number) => {
    if (!localTemplate || !selectedScene) return;
    const duration = Math.max(1, Math.min(3600, newDuration)); // Clamp between 1 and 3600 seconds

    setLocalTemplate({
      ...localTemplate,
      scenes: localTemplate.scenes.map((scene) =>
        scene.id === selectedSceneId
          ? {
              ...scene,
              countdown: {
                ...countdown,
                duration,
              },
            }
          : scene,
      ),
    });
  };

  const handleColorChange = (newColor: string) => {
    if (!localTemplate || !selectedScene || !countdown) return;

    setLocalTemplate({
      ...localTemplate,
      scenes: localTemplate.scenes.map((scene) =>
        scene.id === selectedSceneId
          ? {
              ...scene,
              countdown: {
                ...countdown,
                color: newColor,
              },
            }
          : scene,
      ),
    });
  };

  const handleFontFamilyChange = (newFontFamily: string) => {
    if (!localTemplate || !selectedScene || !countdown) return;

    setLocalTemplate({
      ...localTemplate,
      scenes: localTemplate.scenes.map((scene) =>
        scene.id === selectedSceneId
          ? {
              ...scene,
              countdown: {
                ...countdown,
                fontFamily: newFontFamily,
              },
            }
          : scene,
      ),
    });
  };

  const selectedFontLabel = FONT_OPTIONS.find((font) => font.value === fontFamily)?.label || "Inter";

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex flex-col items-center">
        {/* Control Bar - appears above on hover */}
        <div
          ref={controlBarRef}
          className={cn(
            "absolute bottom-full mb-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 shadow-lg transition-all duration-200 z-[60]",
            isHovered ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none",
          )}
        >
          <div className="flex items-center gap-2">
            <label className="text-sm text-white whitespace-nowrap">Duration (s):</label>
            <Input
              type="number"
              min="1"
              max="3600"
              value={countdown.duration}
              onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
              className="w-20 h-8 bg-white/10 border-white/20 text-white"
              style={{ color: "white" }}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-white whitespace-nowrap">Color:</label>
            <div className="relative">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border border-white/20"
                style={{ backgroundColor: "transparent" }}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-white whitespace-nowrap">Font:</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 bg-white/10 border-white/20 text-white hover:bg-white/20 w-40 justify-between"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <span className="truncate">{selectedFontLabel}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-60 overflow-y-auto">
                {FONT_OPTIONS.map((font) => (
                  <DropdownMenuItem
                    style={{ fontFamily: font.value }}
                    key={font.value}
                    onClick={() => handleFontFamilyChange(font.value)}
                    className={cn(font.value === fontFamily && "bg-accent")}
                  >
                    {font.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Countdown Display */}
        <div
          style={{
            color,
            fontFamily,
            fontSize: "120px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          data-countdown
        >
          {formatTime(remainingSeconds)}
        </div>
      </div>
    </div>
  );
}

export default CountdownScene;
