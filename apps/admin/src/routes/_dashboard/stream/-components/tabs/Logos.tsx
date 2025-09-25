import { useGetMedia, useUploadMedia } from "@/hooks/queries/useMedia";
import { useAuth } from "@/hooks/useAuth";
import { Button, cn, Progress, type Media } from "@tribe-nest/frontend-shared";
import { Plus } from "lucide-react";
import { useRef } from "react";
import { useParticipantStore } from "../store";

export function Logos() {
  const { currentProfileAuthorization } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: logos } = useGetMedia(currentProfileAuthorization?.profile?.id, "stream_logo", "image");
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
      parent: "stream_logo",
      type: "image",
    });
  };

  const handleChangeLogo = (logo: Media) => {
    if (selectedScene) {
      setLocalTemplate({
        ...localTemplate,
        scenes: localTemplate.scenes.map((scene) =>
          scene.id === selectedSceneId ? { ...scene, logo: { id: logo.id, url: logo.url } } : scene,
        ),
      });
    }
  };
  const handleRemoveLogo = () => {
    if (selectedScene) {
      setLocalTemplate({
        ...localTemplate,
        scenes: localTemplate.scenes.map((scene) =>
          scene.id === selectedSceneId ? { ...scene, logo: undefined } : scene,
        ),
      });
    }
  };
  return (
    <>
      {isUploading && <Progress value={progress} className="w-full" />}
      <div className="flex gap-2 flex-wrap">
        {logos?.map((item) => {
          const isSelected = selectedScene?.logo?.id === item.id;
          return (
            <div
              key={item.id}
              className={cn("h-10 aspect-video cursor-pointer", isSelected && "border-2 border-primary")}
              onClick={() => (isSelected ? handleRemoveLogo() : handleChangeLogo(item))}
            >
              <img src={item.url} alt={item.name} className="object-cover w-full h-full" />
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
