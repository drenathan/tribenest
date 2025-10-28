import type { IStreamBroadcastComment } from "@/types/event";
import { useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChannelLogos } from "../assets";
import { useParticipantStore } from "../store";
import { cn } from "@tribe-nest/frontend-shared";

type Props = {
  comments: IStreamBroadcastComment[];
};
export function CommentsTab({ comments }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { localTemplate, setLocalTemplate } = useParticipantStore();
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [comments]);
  if (!localTemplate) return null;
  const selectedSceneId = localTemplate.config.selectedSceneId || localTemplate.scenes[0].id;
  const selectedScene = localTemplate.scenes.find((scene) => scene.id === selectedSceneId);

  const handleSelectComment = (comment: IStreamBroadcastComment) => {
    if (selectedScene?.currentComment?.id === comment.id) {
      setLocalTemplate({
        ...localTemplate,
        scenes: localTemplate.scenes.map((scene) =>
          scene.id === selectedSceneId ? { ...scene, currentComment: undefined } : scene,
        ),
      });
    } else {
      setLocalTemplate({
        ...localTemplate,
        scenes: localTemplate.scenes.map((scene) =>
          scene.id === selectedSceneId ? { ...scene, currentComment: comment } : scene,
        ),
      });
    }
  };

  return (
    <div ref={containerRef} className="max-h-[600px] overflow-y-auto">
      {comments.map((comment) => {
        const Logo = ChannelLogos[comment.channelProvider];
        return (
          <div
            onClick={() => handleSelectComment(comment)}
            key={comment.id}
            className={cn(
              "flex flex-col gap-2 p-2 border border-border rounded-md cursor-pointer hover:border-primary transition-colors duration-200 mb-2",
              selectedScene?.currentComment?.id === comment.id && "border-primary",
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6">
                <Logo />
              </div>
              <div className="text-sm text-muted-foreground">{comment.name}</div>
              <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.publishedAt))}</div>
            </div>
            <div className="text-sm">{comment.content}</div>
          </div>
        );
      })}
    </div>
  );
}
