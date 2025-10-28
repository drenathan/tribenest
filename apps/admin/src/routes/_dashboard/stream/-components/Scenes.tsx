import { Button, cn } from "@tribe-nest/frontend-shared";
import { PlusIcon } from "lucide-react";
import { useParticipantStore } from "./store";

function Scenes() {
  const { localTemplate } = useParticipantStore();
  const selectedSceneId = localTemplate?.config.selectedSceneId || localTemplate?.scenes[0].id;
  return (
    <div className="w-[200px] border-r border-border shrink-0 h-screen p-2">
      <Button className="w-full mb-4" variant="outline">
        <PlusIcon className="w-4 h-4" />
        Add Scene
      </Button>
      {localTemplate?.scenes.map((scene) => {
        const isSelected = scene.id === selectedSceneId;
        return (
          <div
            key={scene.id}
            className={cn(
              "border-border border rounded-md p-2 h-30 w-full cursor-pointer",
              isSelected && "border-primary",
            )}
          >
            {scene.title}
          </div>
        );
      })}
    </div>
  );
}

export default Scenes;
