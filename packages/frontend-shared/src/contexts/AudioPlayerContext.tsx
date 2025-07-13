"use client";
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

export interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  coverImage?: string;
  url: string;
  duration?: number;
  productId?: string;
}

interface AudioPlayerContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
  volume: number;
  isMuted: boolean;
  play: () => void;
  pause: VoidFunction;
  seek: (time: number) => void;
  loadAndPlay: (track: AudioTrack, queue?: AudioTrack[]) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
  queue: AudioTrack[];
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMutedState] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = () => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;

    if (!isPlaying) {
      audio
        .play()
        .catch(() => {
          setError("Failed to play audio");
          setIsPlaying(false);
        })
        .then(() => {
          setIsPlaying(true);
        });
    }
  };

  const pause = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentTrack, isPlaying]);

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;

    const prevIndex = currentQueueIndex > 0 ? currentQueueIndex - 1 : queue.length - 1;
    const prevTrack = queue[prevIndex];

    if (prevTrack) {
      loadAndPlay(prevTrack, queue);
    }
  }, [queue, currentQueueIndex]);

  // Setup media session with direct state access
  const setupMediaSession = useCallback((track: AudioTrack, queue: AudioTrack[]) => {
    if (!navigator.mediaSession) return;

    const currentIndex = queue.findIndex((t) => t.id === track.id);
    setCurrentQueueIndex(currentIndex);

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist || "Unknown Artist",
      album: "Music",
      artwork: track.coverImage
        ? [
            { src: track.coverImage, sizes: "512x512", type: "image/jpeg" },
            { src: track.coverImage, sizes: "256x256", type: "image/jpeg" },
            { src: track.coverImage, sizes: "128x128", type: "image/jpeg" },
          ]
        : undefined,
    });

    // Set action handlers with direct state access
    navigator.mediaSession.setActionHandler("play", () => {
      console.log("play initiated");
      // Get current state directly from audio element
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current
          .play()
          .catch(() => {
            setError("Failed to play audio");
            setIsPlaying(false);
          })
          .then(() => {
            setIsPlaying(true);
          });
      }
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      console.log("pause initiated");
      // Get current state directly from audio element
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    });

    navigator.mediaSession.setActionHandler("previoustrack", () => {
      console.log("previous initiated");
      if (queue.length === 0) return;
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
      const prevTrack = queue[prevIndex];
      if (prevTrack) {
        loadAndPlay(prevTrack, queue);
      }
    });

    navigator.mediaSession.setActionHandler("nexttrack", () => {
      console.log("next initiated");
      if (queue.length === 0) return;
      const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
      const nextTrack = queue[nextIndex];
      if (nextTrack) {
        loadAndPlay(nextTrack, queue);
      }
    });

    navigator.mediaSession.setActionHandler("seekto", (details) => {
      console.log("seekto initiated");
      if (details.seekTime !== undefined && audioRef.current) {
        audioRef.current.currentTime = details.seekTime;
      }
    });

    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      console.log("seekforward initiated");
      if (audioRef.current) {
        const seekTime = Math.min(audioRef.current.currentTime + (details.seekOffset || 10), audioRef.current.duration);
        audioRef.current.currentTime = seekTime;
      }
    });

    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      console.log("seekbackward initiated");
      if (audioRef.current) {
        const seekTime = Math.max(audioRef.current.currentTime - (details.seekOffset || 10), 0);
        audioRef.current.currentTime = seekTime;
      }
    });

    // Update playback state
    navigator.mediaSession.playbackState = "playing";
  }, []);

  const loadAndPlay = useCallback(
    async (track: AudioTrack, newQueue?: AudioTrack[]) => {
      if (!audioRef.current) return;

      setCurrentTrack(track);
      setIsLoading(true);

      const audio = audioRef.current;
      audio.src = track.url;

      // Update queue if provided
      if (newQueue) {
        setQueue(newQueue);
      } else {
        setQueue([]);
      }

      try {
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);

        // Setup media session after successful play
        setupMediaSession(track, newQueue || queue);
      } catch {
        setError("Failed to play audio");
        setIsPlaying(false);
        setIsLoading(false);
      }
    },
    [setupMediaSession, queue],
  );

  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    const nextIndex = currentQueueIndex < queue.length - 1 ? currentQueueIndex + 1 : 0;
    const nextTrack = queue[nextIndex];

    if (nextTrack) {
      loadAndPlay(nextTrack, queue);
    }
  }, [queue, currentQueueIndex, loadAndPlay]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);

    // Auto-play next track if available
    if (queue.length > 0) {
      playNext();
    }
  }, [queue, playNext]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;
    audio.crossOrigin = "anonymous";

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Update media session position state
      if (navigator.mediaSession && currentTrack && audio.duration && audio.currentTime) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          position: audio.currentTime,
          playbackRate: audio.playbackRate,
        });
      }
    };

    const handleError = () => {
      setError("Failed to load audio");
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleEnded, currentTrack]);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Update media session playback state when playing state changes
  useEffect(() => {
    if (navigator.mediaSession) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    setIsMutedState(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      // Unmute
      setIsMutedState(false);
      setVolumeState(previousVolume);
    } else {
      // Mute
      setPreviousVolume(volume);
      setIsMutedState(true);
      setVolumeState(0);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // const destroy = () => {
  //   if (audioRef.current) {
  //     audioRef.current.pause();
  //     audioRef.current.src = "";
  //     audioRef.current = null;
  //   }
  // };

  const value: AudioPlayerContextType = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error,
    volume,
    isMuted,
    play,
    pause,
    seek,
    loadAndPlay,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    queue,
  };

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
