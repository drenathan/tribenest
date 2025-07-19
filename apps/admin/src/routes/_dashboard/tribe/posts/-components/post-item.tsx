import { useAuth } from "@/hooks/useAuth";
import type { IPost, IMedia } from "@/types/post";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  Separator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useAudioPlayer,
} from "@tribe-nest/frontend-shared";
import { Ellipsis, Heart, MessageCircle, Share, Pause, Play, Edit, Trash } from "lucide-react";
import ReactPlayer from "react-player";
import { useNavigate } from "@tanstack/react-router";
import { css } from "@emotion/css";
import { ConfirmationModal } from "../../../-components/confirmation-modal";
import { useState } from "react";
import { useArchivePost, useUnarchivePost } from "@/hooks/mutations/usePost";

type Props = {
  post: IPost;
};

export function PostItem({ post }: Props) {
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const { mutate: archivePost } = useArchivePost();
  const { mutate: unarchivePost } = useUnarchivePost();

  const handleEdit = () => {
    navigate({ to: `/tribe/posts/${post.id}/edit` });
  };

  const handleArchive = () => {
    if (!currentProfileAuthorization?.profile.id) {
      return;
    }

    if (post.archivedAt) {
      unarchivePost({ postId: post.id, profileId: currentProfileAuthorization?.profile.id });
    } else {
      archivePost({ postId: post.id, profileId: currentProfileAuthorization?.profile.id });
    }
  };

  return (
    <div>
      <Card className="p-0 w-full md:w-[600px]">
        <CardContent className="p-0">
          <div className="flex flex-row items-center justify-between p-2">
            <div className="flex flex-row items-center gap-2">
              <Avatar>
                <AvatarImage src={currentProfileAuthorization?.profile?.avatar} />
                <AvatarFallback>{currentProfileAuthorization?.profile?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-bold">{currentProfileAuthorization?.profile?.name}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsArchiveModalOpen(true)}>
                  <Trash className="mr-2 h-4 w-4" />
                  {post.archivedAt ? "Unarchive post" : "Archive post"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="p-4">
            <p className="text-sm">{post.caption}</p>
          </div>
          <Separator />
          <div>{post.media.length > 0 && <PostMedia media={post.media[0]} />}</div>
          <Separator />
          <div className="flex flex-row items-center  p-4 gap-2">
            <Button variant="ghost" size="icon">
              <Heart />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle />
            </Button>
            <Button variant="ghost" size="icon">
              <Share />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        title={post.archivedAt ? "Unarchive post" : "Archive post"}
        text={
          post.archivedAt
            ? "Are you sure you want to unarchive this post?"
            : "Are you sure you want to archive this post?"
        }
        onConfirm={handleArchive}
        isOpen={isArchiveModalOpen}
        setIsOpen={setIsArchiveModalOpen}
      />
    </div>
  );
}

const PostMedia = ({ media }: { media: IMedia }) => {
  if (media.type === "image") {
    return (
      <img
        src={media.url}
        alt={media.name}
        className={css({
          width: "100%",
          aspectRatio: "auto",
          objectFit: "cover",
          "@media (min-width: 768px)": {
            maxHeight: "80vh",
          },
        })}
      />
    );
  }

  if (media.type === "video") {
    return (
      <div className="w-full @md:max-h-[50vh]">
        <ReactPlayer
          src={media.url}
          width="100%"
          height="auto"
          controls
          playsInline
          className={css({
            aspectRatio: "auto",
            "@media (min-width: 768px)": {
              maxHeight: "50vh",
            },
          })}
        />
      </div>
    );
  }

  if (media.type === "audio") {
    return <AudioPlayer media={media} />;
  }

  return null;
};

const AudioPlayer = ({ media }: { media: IMedia }) => {
  const { currentProfileAuthorization } = useAuth();
  const { loadAndPlay, isPlaying, currentTrack, play, pause, isLoading } = useAudioPlayer();

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
      artist: currentProfileAuthorization?.profile.name || "",
    });
  };

  return (
    <div className="w-full bg-muted/50 rounded-lg p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isLoading
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause size={20} />
          ) : (
            <Play size={20} />
          )}
        </button>
      </div>
    </div>
  );
};
