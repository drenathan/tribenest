import React, { useState } from "react";
import { Button, useAudioPlayer } from "@tribe-nest/frontend-shared";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, X, Maximize2, VolumeX } from "lucide-react";

export function GlobalAudioPlayer() {
  const {
    pause,
    play,
    currentTime,
    isLoading,
    error,
    currentTrack,
    seek,
    duration,
    isPlaying,
    volume,
    isMuted,
    setVolume,
    toggleMute,
  } = useAudioPlayer();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!currentTrack) {
    return null;
  }

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      seek(newTime);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(percentage);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const canGoNext = false;
  const canGoPrevious = false;
  const next = () => {};
  const previous = () => {};

  // Minimized floating player
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-4 right-4 bg-background border border-border rounded-lg shadow-lg z-50 cursor-pointer hover:shadow-xl transition-all duration-300 ease-in-out transform animate-in slide-in-from-bottom-2 text-foreground"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-3 p-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
            {currentTrack.coverImage ? (
              <img src={currentTrack.coverImage} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Music className="w-5 h-5 text-white opacity-50" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-medium text-foreground truncate">{currentTrack.title}</h4>
            {currentTrack.artist && <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            disabled={isLoading}
            className="w-8 h-8 flex-shrink-0"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          <Maximize2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    );
  }

  // Full player
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 text-foreground transition-all duration-300 ease-in-out animate-in slide-in-from-bottom">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto relative sm:justify-between">
        {/* Track Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            {currentTrack.coverImage ? (
              <img src={currentTrack.coverImage} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Music className="w-6 h-6 text-white opacity-50" />
              </div>
            )}
          </div>

          <div className="">
            <h4 className="text-sm font-medium text-foreground truncate">{currentTrack.title}</h4>
            {currentTrack.artist && <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 max-w-md md:flex-1">
          {/* Playback Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={previous} disabled={!canGoPrevious} className="w-8 h-8">
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={handlePlayPause} disabled={isLoading} className="w-10 h-10">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            <Button variant="ghost" size="icon" onClick={next} disabled={!canGoNext} className="w-8 h-8">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
            <span className="text-xs text-muted-foreground font-mono min-w-[2rem]">{formatTime(currentTime)}</span>

            <div className="flex-1 bg-muted rounded-full h-1 cursor-pointer group relative" onClick={handleSeek}>
              <div
                className="bg-primary h-1 rounded-full transition-all duration-100 relative"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm" />
              </div>
            </div>

            <span className="text-xs text-muted-foreground font-mono min-w-[2rem]">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="w-8 h-8 hover:bg-muted/50 transition-colors duration-200"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            ) : volume < 0.5 ? (
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>

          <div className="w-20 bg-muted rounded-full h-1 cursor-pointer group relative" onClick={handleVolumeChange}>
            <div
              className="bg-primary h-1 rounded-full transition-all duration-100 relative"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm" />
            </div>
          </div>
        </div>

        {/* Close Button - Absolute positioned on the right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMinimized(true)}
          className="md:fixed right-2 bottom-8 z-100 w-8 h-8 hover:bg-muted/50 transition-colors duration-200"
        >
          <X className="w-8 h-8" />
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 pb-3">
          <div className="bg-destructive/10 text-destructive text-xs px-3 py-2 rounded-md">{error}</div>
        </div>
      )}
    </div>
  );
}
