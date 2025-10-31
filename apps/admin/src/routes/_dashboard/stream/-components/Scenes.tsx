import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from "@tribe-nest/frontend-shared";
import { MoreVerticalIcon, PlusIcon } from "lucide-react";
import { useParticipantStore } from "./store";
import { SceneLayout, SceneType, type IScene } from "@/types/event";
import { v4 as uuid } from "uuid";
import { useState } from "react";

function Scenes() {
  const { localTemplate, setLocalTemplate } = useParticipantStore();
  const selectedSceneId = localTemplate?.config.selectedSceneId || localTemplate?.scenes[0].id;
  const [isRenameSceneOpen, setIsRenameSceneOpen] = useState(false);
  const [selectedScene, setSelectedScene] = useState<IScene | null>(null);
  const [renameSceneTitle, setRenameSceneTitle] = useState("");

  const handleAddScene = (sceneType: SceneType) => {
    if (!localTemplate) return;

    const isCountdownScene = sceneType === SceneType.Countdown;

    const newScene = {
      id: uuid(),
      title: `Scene ${(localTemplate.scenes.length ?? 0) + 1}`,
      layout: SceneLayout.Solo,
      type: sceneType,
      ...(isCountdownScene && { countdown: { duration: 30, color: "#FFFFFF" } }),
    };

    setLocalTemplate({
      ...localTemplate,
      scenes: [...(localTemplate.scenes ?? []), newScene],
    });
  };

  const handleDeleteScene = (sceneId: string) => {
    if (!localTemplate) return;

    setLocalTemplate({
      ...localTemplate,
      scenes: localTemplate.scenes.filter((scene) => scene.id !== sceneId),
    });
  };

  const handleDuplicateScene = (sceneId: string) => {
    if (!localTemplate) return;
    const scene = localTemplate.scenes.find((scene) => scene.id === sceneId);
    if (!scene) return;

    const newScene = {
      ...scene,
      id: uuid(),
    };

    setLocalTemplate({
      ...localTemplate,
      scenes: [...localTemplate.scenes, newScene],
    });
  };

  const handleRenameScene = (sceneId: string, title: string) => {
    if (!localTemplate) return;
    setLocalTemplate({
      ...localTemplate,
      scenes: localTemplate.scenes.map((scene) => (scene.id === sceneId ? { ...scene, title } : scene)),
    });
    setIsRenameSceneOpen(false);
    setSelectedScene(null);
    setRenameSceneTitle("");
  };

  const handleSelectScene = (sceneId: string) => {
    if (!localTemplate) return;
    setLocalTemplate({
      ...localTemplate,
      config: { ...localTemplate.config, selectedSceneId: sceneId },
    });
  };

  return (
    <div className="w-[200px] border-r border-border shrink-0 h-screen p-2 ">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full mb-4" variant="outline">
            <PlusIcon className="w-4 h-4" />
            Add Scene
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-50">
          <DropdownMenuLabel>Scene Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAddScene(SceneType.Camera)}>Camera</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddScene(SceneType.Countdown)}>Countdown</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex flex-col gap-2">
        {localTemplate?.scenes.map((scene) => {
          const isSelected = scene.id === selectedSceneId;
          return (
            <div
              key={scene.id}
              onClick={() => handleSelectScene(scene.id)}
              className={cn(
                "border-border border rounded-md p-2 w-full cursor-pointer flex items-center justify-between",
                isSelected && "border-primary",
              )}
            >
              <p className="text-sm font-medium">{scene.title}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <MoreVerticalIcon className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-50">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRenameSceneOpen(true);
                      setSelectedScene(scene);
                      setRenameSceneTitle(scene.title);
                    }}
                  >
                    Rename
                  </DropdownMenuItem>
                  {!isSelected && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScene(scene.id);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateScene(scene.id);
                    }}
                  >
                    Duplicate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      {isRenameSceneOpen && selectedScene && (
        <Dialog open={isRenameSceneOpen} onOpenChange={setIsRenameSceneOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Scene</DialogTitle>
            </DialogHeader>
            <DialogDescription>Enter the new name for the scene.</DialogDescription>

            <div>
              <Input
                value={renameSceneTitle}
                name="title"
                placeholder="Enter scene title"
                onChange={(e) => setRenameSceneTitle(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRenameSceneOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleRenameScene(selectedScene.id, renameSceneTitle)}>Rename</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default Scenes;
