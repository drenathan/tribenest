"use client";
import React, { useState, useEffect } from "react";
import { useEditorContext } from "../editor/context";
import { useAudioPlayer } from "../../contexts/AudioPlayerContext";
import { alphaToHexCode } from "../../lib/utils";
import { css } from "@emotion/css";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, X, Maximize2, VolumeX } from "lucide-react";

export function ThemeAudioPlayer() {
  const { themeSettings } = useEditorContext();
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
    queue,
    playNext,
    playPrevious,
  } = useAudioPlayer();
  const [isMinimized, setIsMinimized] = useState(false);
  const { navigate } = useEditorContext();

  // Add rotation animation style
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

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

  const canGoNext = queue.length > 1;
  const canGoPrevious = queue.length > 1;

  // Minimized floating player
  if (isMinimized) {
    return (
      <div
        className={css({
          position: "fixed",
          bottom: "16px",
          right: "16px",
          backgroundColor: themeSettings.colors.background,
          border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
          borderRadius: `${themeSettings.cornerRadius}px`,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          zIndex: 50,
          cursor: "pointer",
          transition: "all 0.3s ease-in-out",
          color: themeSettings.colors.text,
          fontFamily: themeSettings.fontFamily,
          "&:hover": {
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            transform: "translateY(-2px)",
          },
        })}
        onClick={() => setIsMinimized(false)}
      >
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
          })}
        >
          <div
            className={css({
              width: "40px",
              height: "40px",
              borderRadius: `${themeSettings.cornerRadius}px`,
              overflow: "hidden",
              flexShrink: 0,
            })}
          >
            {currentTrack.coverImage ? (
              <img
                src={currentTrack.coverImage}
                alt={currentTrack.title}
                className={css({
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                })}
              />
            ) : (
              <div
                className={css({
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(135deg, ${themeSettings.colors.primary}${alphaToHexCode(0.8)}, ${themeSettings.colors.primary}${alphaToHexCode(0.6)})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                })}
              >
                <Music
                  className={css({
                    width: "20px",
                    height: "20px",
                    color: themeSettings.colors.textPrimary,
                    opacity: 0.7,
                  })}
                />
              </div>
            )}
          </div>

          <div
            className={css({
              minWidth: 0,
              flex: 1,
            })}
          >
            <h4
              className={css({
                fontSize: "14px",
                fontWeight: "600",
                color: themeSettings.colors.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                margin: 0,
              })}
            >
              {currentTrack.title}
            </h4>
            {currentTrack.artist && (
              <p
                className={css({
                  fontSize: "12px",
                  color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}`,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  margin: 0,
                })}
              >
                {currentTrack.artist}
              </p>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            disabled={isLoading}
            className={css({
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "transparent",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: themeSettings.colors.text,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
              },
              "&:disabled": {
                opacity: 0.5,
              },
            })}
          >
            {isLoading ? (
              <div
                className={css({
                  width: "16px",
                  height: "16px",
                  border: `2px solid currentColor`,
                  borderTop: "transparent",
                  borderRadius: "50%",
                  animation: "rotate 1s linear infinite",
                })}
              />
            ) : isPlaying ? (
              <Pause className={css({ width: "16px", height: "16px" })} />
            ) : (
              <Play className={css({ width: "16px", height: "16px" })} />
            )}
          </button>

          <Maximize2
            className={css({
              width: "16px",
              height: "16px",
              color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}`,
              flexShrink: 0,
            })}
          />
        </div>
      </div>
    );
  }

  // Full player
  return (
    <div
      style={{
        background: themeSettings.colors.background,
        borderTop: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
      }}
      className={css({
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: themeSettings.colors.background,
        borderTop: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
        zIndex: 50,
        color: themeSettings.colors.text,
        fontFamily: themeSettings.fontFamily,
        transition: "all 0.3s ease-in-out",
      })}
    >
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
        })}
      >
        {/* Track Info */}
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "12px",
          })}
        >
          <div
            className={css({
              width: "48px",
              height: "48px",
              borderRadius: `${themeSettings.cornerRadius}px`,
              overflow: "hidden",
              flexShrink: 0,
            })}
          >
            {currentTrack.coverImage ? (
              <img
                src={currentTrack.coverImage}
                alt={currentTrack.title}
                className={css({
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                })}
              />
            ) : (
              <div
                className={css({
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(135deg, ${themeSettings.colors.primary}${alphaToHexCode(0.8)}, ${themeSettings.colors.primary}${alphaToHexCode(0.6)})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                })}
              >
                <Music
                  className={css({
                    width: "24px",
                    height: "24px",
                    color: themeSettings.colors.textPrimary,
                    opacity: 0.7,
                  })}
                />
              </div>
            )}
          </div>

          <div className="cursor-pointer hover:underline" onClick={() => navigate(`/music/${currentTrack.productId}`)}>
            <h4
              className={css({
                fontSize: "14px",
                fontWeight: "600",
                color: themeSettings.colors.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                margin: 0,
                maxWidth: "200px",
              })}
            >
              {currentTrack.title}
            </h4>
            {currentTrack.artist && (
              <p
                className={css({
                  fontSize: "12px",
                  color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}`,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  margin: 0,
                  maxWidth: "200px",
                })}
              >
                {currentTrack.artist}
              </p>
            )}
          </div>
        </div>

        <div
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "12px",
            maxWidth: "400px",
            flex: 1,
          })}
        >
          {/* Playback Controls */}
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            })}
          >
            <button
              onClick={playPrevious}
              disabled={!canGoPrevious}
              className={css({
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "transparent",
                cursor: canGoPrevious ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: canGoPrevious ? themeSettings.colors.text : `${themeSettings.colors.text}${alphaToHexCode(0.3)}`,
                transition: "all 0.2s ease",
                "&:hover": canGoPrevious
                  ? {
                      backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
                    }
                  : {},
              })}
            >
              <SkipBack className={css({ width: "16px", height: "16px" })} />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={isLoading}
              className={css({
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: themeSettings.colors.primary,
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: themeSettings.colors.textPrimary,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.9)}`,
                },
                "&:disabled": {
                  opacity: 0.5,
                },
              })}
            >
              {isLoading ? (
                <div
                  className={css({
                    width: "20px",
                    height: "20px",
                    border: `2px solid currentColor`,
                    borderTop: "transparent",
                    borderRadius: "50%",
                    animation: "rotate 1s linear infinite",
                  })}
                />
              ) : isPlaying ? (
                <Pause className={css({ width: "20px", height: "20px" })} />
              ) : (
                <Play className={css({ width: "20px", height: "20px" })} />
              )}
            </button>

            <button
              onClick={playNext}
              disabled={!canGoNext}
              className={css({
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "transparent",
                cursor: canGoNext ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: canGoNext ? themeSettings.colors.text : `${themeSettings.colors.text}${alphaToHexCode(0.3)}`,
                transition: "all 0.2s ease",
                "&:hover": canGoNext
                  ? {
                      backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
                    }
                  : {},
              })}
            >
              <SkipForward className={css({ width: "16px", height: "16px" })} />
            </button>
          </div>

          {/* Progress Bar */}
          <div
            className={css({
              display: "none",
              "@media (min-width: 768px)": {
                display: "flex",
              },
              alignItems: "center",
              gap: "12px",
              flex: 1,
              maxWidth: "400px",
            })}
          >
            <span
              className={css({
                fontSize: "12px",
                color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}`,
                fontFamily: "monospace",
                minWidth: "32px",
              })}
            >
              {formatTime(currentTime)}
            </span>

            <div
              className={css({
                flex: 1,
                backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
                borderRadius: "4px",
                height: "4px",
                cursor: "pointer",
                position: "relative",
                "&:hover": {
                  "& > div:last-child": {
                    opacity: 1,
                  },
                },
              })}
              onClick={handleSeek}
            >
              <div
                className={css({
                  backgroundColor: themeSettings.colors.primary,
                  height: "4px",
                  borderRadius: "4px",
                  transition: "all 0.1s ease",
                  position: "relative",
                })}
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div
                  className={css({
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "12px",
                    height: "12px",
                    backgroundColor: themeSettings.colors.primary,
                    borderRadius: "50%",
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  })}
                />
              </div>
            </div>

            <span
              className={css({
                fontSize: "12px",
                color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}`,
                fontFamily: "monospace",
                minWidth: "32px",
              })}
            >
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div
          className={css({
            display: "none",
            "@media (min-width: 768px)": {
              display: "flex",
            },
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          })}
        >
          <button
            onClick={toggleMute}
            className={css({
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: themeSettings.colors.text,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
              },
            })}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className={css({ width: "16px", height: "16px" })} />
            ) : (
              <Volume2 className={css({ width: "16px", height: "16px" })} />
            )}
          </button>

          <div
            className={css({
              width: "80px",
              backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
              borderRadius: "4px",
              height: "4px",
              cursor: "pointer",
              position: "relative",
              "&:hover": {
                "& > div:last-child": {
                  opacity: 1,
                },
              },
            })}
            onClick={handleVolumeChange}
          >
            <div
              className={css({
                backgroundColor: themeSettings.colors.primary,
                height: "4px",
                borderRadius: "4px",
                transition: "all 0.1s ease",
                position: "relative",
              })}
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            >
              <div
                className={css({
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "12px",
                  height: "12px",
                  backgroundColor: themeSettings.colors.primary,
                  borderRadius: "50%",
                  opacity: 0,
                  transition: "opacity 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                })}
              />
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsMinimized(true)}
          className={css({
            position: "fixed",
            right: "8px",
            bottom: "32px",
            zIndex: 100,
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: themeSettings.colors.text,
            transition: "all 0.2s ease",
            "@media (min-width: 768px)": {
              position: "static",
            },
            "&:hover": {
              backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
            },
          })}
        >
          <X className={css({ width: "20px", height: "20px" })} />
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className={css({
            padding: "0 16px 12px",
          })}
        >
          <div
            className={css({
              backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
              color: themeSettings.colors.primary,
              fontSize: "12px",
              padding: "8px 12px",
              borderRadius: `${themeSettings.cornerRadius}px`,
              border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.3)}`,
            })}
          >
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
