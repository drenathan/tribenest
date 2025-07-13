import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";

export const FileAudioPlayer = ({ file }: { file: File }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [fileUrl, setFileUrl] = useState<string>("");

  useEffect(() => {
    if (file) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [file]);

  // Create object URL when file changes
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Set audio source when URL is ready
  useEffect(() => {
    if (fileUrl && audioRef.current) {
      audioRef.current.src = fileUrl;
      audioRef.current.load();
    }
  }, [fileUrl]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Play failed:", error);
          });
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;

      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-card border rounded-lg p-4">
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handlePlayPause}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground font-mono min-w-[2rem]">{formatTime(currentTime)}</span>
            <div className="flex-1 bg-muted rounded-full h-2 cursor-pointer group relative" onClick={handleSeek}>
              <div
                className="bg-primary h-2 rounded-full transition-all duration-100 relative"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-mono min-w-[2rem]">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
