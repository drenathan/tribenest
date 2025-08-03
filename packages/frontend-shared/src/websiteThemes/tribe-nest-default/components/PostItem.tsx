"use client";
import React, { useState, useEffect, useCallback } from "react";
import { type UserComponent } from "@craftjs/core";
import { useContainerQueryContext, useEditorContext } from "../../../components/editor/context";
import { alphaToHexCode } from "../../../lib/utils";
import { css } from "@emotion/css";
import type { IPublicPost, IMedia, IPublicComment } from "../../../types";
import { useAudioPlayer } from "../../../contexts/AudioPlayerContext";
import {
  EditorButtonWithoutEditor,
  EditorIcon,
  EditorInputWithoutEditor,
  EditorModal,
} from "../../../components/editor/selectors";
import { usePublicAuth } from "../../../contexts/PublicAuthContext";
import ReactPlayer from "react-player";
//empty here

interface PostItemProps {
  post: IPublicPost;
}

//empty here
//empty here
//empty here
export const PostItem: UserComponent<PostItemProps> = ({ post }) => {
  const { themeSettings, profile, httpClient, navigate } = useEditorContext();
  const { isAuthenticated } = usePublicAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<IPublicComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // empty here

  const loadLikeStatus = useCallback(async () => {
    if (!httpClient) return;
    try {
      const response = await httpClient.get("/public/likes/status", {
        params: { entityId: post.id, entityType: "post" },
      });
      setIsLiked(response.data.liked);
    } catch (error) {
      console.error("Error loading like status:", error);
    }
  }, [httpClient, post.id]);

  const loadSaveStatus = useCallback(async () => {
    if (!httpClient) return;
    try {
      const response = await httpClient.get("/public/saves/status", {
        params: { entityId: post.id, entityType: "post" },
      });
      setIsSaved(response.data.saved);
    } catch (error) {
      console.error("Error loading save status:", error);
    }
  }, [httpClient, post.id]);

  const loadCounts = useCallback(async () => {
    if (!httpClient) return;
    try {
      const [likeResponse, commentResponse] = await Promise.all([
        httpClient.get("/public/likes/count", { params: { entityId: post.id, entityType: "post" } }),
        httpClient.get("/public/comments/count", { params: { entityId: post.id, entityType: "post" } }),
      ]);
      setLikeCount(likeResponse.data.count);
      setCommentCount(commentResponse.data.count);
    } catch (error) {
      console.error("Error loading counts:", error);
    }
  }, [httpClient, post.id]);

  // Load initial state
  useEffect(() => {
    if (isAuthenticated && httpClient) {
      loadLikeStatus();
      loadSaveStatus();
      loadCounts();
    }
  }, [isAuthenticated, httpClient, loadLikeStatus, loadSaveStatus, loadCounts, post.id, post.type]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!httpClient) return;

    try {
      if (isLiked) {
        await httpClient.delete("/public/likes", {
          data: { entityId: post.id, entityType: "post" },
        });
        setIsLiked(false);
        setLikeCount((prev) => Number(prev) - 1);
      } else {
        await httpClient.post("/public/likes", {
          entityId: post.id,
          entityType: "post",
        });
        setIsLiked(true);
        setLikeCount((prev) => Number(prev) + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!httpClient) return;

    try {
      if (isSaved) {
        await httpClient.delete("/public/saves", {
          data: { entityId: post.id, entityType: "post" },
        });
        setIsSaved(false);
      } else {
        await httpClient.post("/public/saves", {
          entityId: post.id,
          entityType: "post",
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const handleCommentClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowComments(true);
    loadComments();
  };

  const loadComments = useCallback(async () => {
    if (!httpClient) return;
    try {
      const response = await httpClient.get("/public/comments", {
        params: { entityId: post.id, entityType: "post" },
      });
      setComments(response.data.comments);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  }, [httpClient, post.id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!httpClient) return;

    setIsLoading(true);
    try {
      await httpClient.post("/public/comments", {
        entityId: post.id,
        entityType: "post",
        content: newComment,
      });
      setNewComment("");
      await loadComments();
      setCommentCount((prev) => Number(prev) + 1);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={css({
        width: "100%",
        borderRadius: `${themeSettings.cornerRadius}px`,
        backgroundColor: themeSettings.colors.background,
        border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      })}
    >
      {/* Header */}
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
        })}
      >
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "8px",
          })}
        >
          <div
            className={css({
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: themeSettings.colors.primary,
              fontWeight: "bold",
              fontSize: "16px",
            })}
          >
            {profile?.name?.charAt(0) || "U"}
          </div>
          <span
            className={css({
              fontSize: "14px",
              fontWeight: "bold",
              color: themeSettings.colors.text,
            })}
          >
            {profile?.name || "User"}
          </span>
        </div>
        <button
          className={css({
            padding: "4px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            color: themeSettings.colors.text,
            "&:hover": {
              backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
            },
          })}
        >
          <EditorIcon icon="more-horizontal" />
        </button>
      </div>

      {/* Caption */}
      <div
        className={css({
          padding: "16px",
          color: themeSettings.colors.text,
          fontSize: "14px",
          lineHeight: "1.5",
        })}
      >
        {post.caption}
      </div>

      {/* Separator */}
      <div
        className={css({
          height: "1px",
          backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
        })}
      />

      {/* Media or Poll */}
      {post.type === "poll" ? (
        <PollContent post={post} />
      ) : post.hasAccess && post.media?.[0] ? (
        <PostMedia media={post.media[0]} />
      ) : !post.hasAccess ? (
        <NoAccessContent post={post} />
      ) : null}

      {/* Separator */}
      <div
        className={css({
          height: "1px",
          backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
        })}
      />

      {/* Actions */}
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "16px",
        })}
      >
        <ActionButton
          icon={<EditorIcon icon="heart" fill={isLiked ? themeSettings.colors.text : "none"} />}
          count={likeCount}
          onClick={handleLike}
        />
        <ActionButton icon={<EditorIcon icon="message-circle" />} count={commentCount} onClick={handleCommentClick} />
        <ActionButton
          icon={<EditorIcon icon="bookmark" fill={isSaved ? themeSettings.colors.text : "none"} />}
          onClick={handleSave}
        />
      </div>

      {/* Comments Modal */}
      <EditorModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        title="Comments"
        content={
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.fullName || "User"}</span>
                    <span
                      style={{
                        color: `${themeSettings.colors.text}${alphaToHexCode(0.5)}`,
                      }}
                      className="text-xs"
                    >
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
            <div
              className={css({
                paddingTop: "16px",
                borderTop: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.4)}`,
              })}
            >
              <div className="flex gap-2">
                <EditorInputWithoutEditor
                  value={newComment}
                  onChange={(e) => setNewComment(e)}
                  placeholder="Add a comment..."
                  width="100%"
                />

                <EditorButtonWithoutEditor
                  text="Post"
                  onClick={handleAddComment}
                  disabled={isLoading || !newComment.trim()}
                />
              </div>
            </div>
          </div>
        }
        size="lg"
      />
    </div>
  );
};

export const ActionButton = ({
  icon,
  count,
  onClick,
}: {
  icon: React.ReactNode;
  count?: number;
  onClick?: () => void;
}) => {
  const { themeSettings } = useEditorContext();

  return (
    <button
      onClick={onClick}
      className={css({
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "8px",
        borderRadius: "4px",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        color: themeSettings.colors.text,
        fontSize: "14px",
        "&:hover": {
          backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
        },
      })}
    >
      {icon}
      {count !== undefined && <span className="text-xs">{count}</span>}
    </button>
  );
};

export const PostMedia = ({ media }: { media: IMedia }) => {
  const { themeSettings, profile } = useEditorContext();
  const { loadAndPlay, isPlaying, currentTrack, pause, play, isLoading } = useAudioPlayer();
  const {
    matches: { isMobile },
  } = useContainerQueryContext();
  const handlePlayPause = async () => {
    if (isPlaying && currentTrack?.id === media.id) {
      return pause();
    }
    if (currentTrack?.id === media.id) {
      return play();
    }
    loadAndPlay({
      url: media.url,
      title: "Post Audio",
      id: media.id,
      artist: profile?.name || "",
    });
  };

  if (media.type === "image") {
    return (
      <img
        src={media.url}
        alt={media.name}
        className={css({
          width: "100%",
          aspectRatio: "auto",
          objectFit: "cover",
        })}
      />
    );
  }

  if (media.type === "video") {
    return (
      <div className="w-full">
        <ReactPlayer
          src={media.url}
          width="100%"
          height="auto"
          controls
          playsInline
          className={css({
            aspectRatio: "auto",
            maxHeight: isMobile ? "auto" : "50vh",
          })}
        />
      </div>
    );
  }

  if (media.type === "audio") {
    return (
      <div
        className={css({
          width: "100%",
          backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.05)}`,
          borderRadius: "8px",
          padding: "16px",
        })}
      >
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "16px",
          })}
        >
          <button
            onClick={handlePlayPause}
            disabled={isLoading}
            className={css({
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              backgroundColor: isLoading
                ? `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`
                : themeSettings.colors.primary,
              color: isLoading ? themeSettings.colors.text : themeSettings.colors.textPrimary,
              "&:hover": {
                backgroundColor: isLoading
                  ? `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`
                  : `${themeSettings.colors.primary}${alphaToHexCode(0.9)}`,
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
                style={{
                  animation: "rotate 1s linear infinite",
                }}
              />
            ) : isPlaying ? (
              <EditorIcon icon="pause" />
            ) : (
              <EditorIcon icon="play" />
            )}
          </button>
          <div
            className={css({
              flex: 1,
              color: themeSettings.colors.text,
            })}
          >
            <div
              className={css({
                fontWeight: "500",
                fontSize: "14px",
                marginBottom: "4px",
              })}
            >
              {media.name}
            </div>
            <div
              className={css({
                fontSize: "12px",
                color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}`,
              })}
            >
              Audio Track
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (media.type === "document") {
    return (
      <div
        className={css({
          width: "100%",
          backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.05)}`,
          borderRadius: "8px",
          padding: "16px",
          margin: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        })}
      >
        <div
          className={css({
            width: "40px",
            height: "40px",
            backgroundColor: themeSettings.colors.primary,
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: themeSettings.colors.textPrimary,
          })}
        >
          📄
        </div>
        <div
          className={css({
            flex: 1,
            color: themeSettings.colors.text,
          })}
        >
          <div
            className={css({
              fontWeight: "500",
              fontSize: "14px",
              marginBottom: "4px",
            })}
          >
            {media.name}
          </div>
          <div
            className={css({
              fontSize: "12px",
              color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}`,
            })}
          >
            Document
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export const PollContent = ({ post }: { post: IPublicPost }) => {
  const { themeSettings } = useEditorContext();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Mock poll options - in real implementation this would come from post data
  const pollOptions = [
    { id: 1, text: "Option 1", votes: 15 },
    { id: 2, text: "Option 2", votes: 8 },
    { id: 3, text: "Option 3", votes: 12 },
  ];

  const totalVotes = pollOptions.reduce((sum, option) => sum + option.votes, 0);

  const handleOptionClick = (optionId: number) => {
    setSelectedOption(optionId);
  };

  return (
    <div
      className={css({
        padding: "16px",
        backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.05)}`,
        margin: "16px",
        borderRadius: "8px",
      })}
    >
      <div
        className={css({
          fontSize: "16px",
          fontWeight: "600",
          color: themeSettings.colors.text,
          marginBottom: "16px",
        })}
      >
        Poll {post.id}
      </div>
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        })}
      >
        {pollOptions.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={css({
                position: "relative",
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: `2px solid ${isSelected ? themeSettings.colors.primary : `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`}`,
                backgroundColor: isSelected ? `${themeSettings.colors.primary}${alphaToHexCode(0.1)}` : "transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.05)}`,
                },
              })}
            >
              <div
                className={css({
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: themeSettings.colors.text,
                  fontSize: "14px",
                  fontWeight: isSelected ? "600" : "400",
                })}
              >
                <span>{option.text}</span>
                <span>{Math.round(percentage)}%</span>
              </div>
              <div
                className={css({
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${percentage}%`,
                  backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
                  borderRadius: "6px",
                  zIndex: 0,
                })}
              />
            </button>
          );
        })}
      </div>
      <div
        className={css({
          fontSize: "12px",
          color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}`,
          marginTop: "12px",
          textAlign: "center",
        })}
      >
        {totalVotes} votes
      </div>
    </div>
  );
};

const NoAccessContent = ({ post }: { post: IPublicPost }) => {
  const { themeSettings } = useEditorContext();

  return (
    <div
      key={post.id}
      className={css({
        width: "100%",
        backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.05)}`,
        borderRadius: "8px",
        padding: "40px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        textAlign: "center",
      })}
    >
      <div
        className={css({
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: themeSettings.colors.primary,
        })}
      >
        <EditorIcon icon="lock" size={24} />
      </div>
      <div>
        <div
          className={css({
            fontSize: "16px",
            fontWeight: "600",
            color: themeSettings.colors.text,
            marginBottom: "4px",
          })}
        >
          Content Locked
        </div>
        <div
          className={css({
            fontSize: "14px",
            color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}`,
          })}
        >
          Subscribe to access this content
        </div>
        <div className="mt-4">
          <EditorButtonWithoutEditor text="Subscribe" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};

PostItem.craft = {
  displayName: "Post Item",
};
