import { useGetMedia, useUploadMedia } from "@/hooks/queries/useMedia";
import { useAuth } from "@/hooks/useAuth";
import { Button, cn, Progress, type Media } from "@tribe-nest/frontend-shared";
import { Plus } from "lucide-react";
import { useRef } from "react";
import { useParticipantStore } from "../store";

export function Backgrounds() {
  const { currentProfileAuthorization } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: backgrounds } = useGetMedia(currentProfileAuthorization?.profile?.id, "stream_background", "image");
  const { uploadMedia, isUploading, progress } = useUploadMedia();
  const { localTemplate, setLocalTemplate } = useParticipantStore();

  if (!localTemplate) return null;
  const selectedSceneId = localTemplate.config.selectedSceneId || localTemplate.scenes[0].id;
  const selectedScene = localTemplate.scenes.find((scene) => scene.id === selectedSceneId);

  const handleUpload = async (file: File) => {
    if (!currentProfileAuthorization?.profile?.id) {
      return;
    }
    await uploadMedia({
      file,
      profileId: currentProfileAuthorization?.profile?.id,
      parent: "stream_background",
      type: "image",
    });
  };

  const handleChangeBackground = (background: Media) => {
    if (selectedScene) {
      setLocalTemplate({
        ...localTemplate,
        scenes: localTemplate.scenes.map((scene) =>
          scene.id === selectedSceneId
            ? { ...scene, background: { id: background.id, url: background.url, type: background.type } }
            : scene,
        ),
      });
    }
  };

  const handleRemoveBackground = () => {
    if (selectedScene) {
      setLocalTemplate({
        ...localTemplate,
        scenes: localTemplate.scenes.map((scene) =>
          scene.id === selectedSceneId ? { ...scene, background: undefined } : scene,
        ),
      });
    }
  };

  return (
    <>
      {isUploading && <Progress value={progress} className="w-full" />}
      <div className="flex gap-2 flex-wrap">
        {backgrounds?.map((background) => {
          const isSelected = selectedScene?.background?.id === background.id;
          return (
            <div
              key={background.id}
              className={cn("h-10 aspect-video cursor-pointer", isSelected && "border-2 border-primary")}
              onClick={() => (isSelected ? handleRemoveBackground() : handleChangeBackground(background))}
            >
              <img src={background.url} alt={background.name} className="object-cover w-full h-full" />
            </div>
          );
        })}
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          <Plus />
        </Button>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          hidden
          ref={inputRef}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleUpload(e.target.files[0]);
            }
          }}
        />
      </div>
    </>
  );
}
