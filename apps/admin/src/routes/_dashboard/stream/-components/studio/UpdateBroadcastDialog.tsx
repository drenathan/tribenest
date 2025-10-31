import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Progress,
  Textarea,
} from "@tribe-nest/frontend-shared";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";

import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { ApiError } from "@tribe-nest/frontend-shared";
import { useUploadFiles } from "@/hooks/useUploadFiles";
import { useParticipantStore } from "../store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

function UpdateBroadcastDialog({ open, onOpenChange, onUpdate }: Props) {
  const { currentProfileAuthorization } = useAuth();

  const [description, setDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { localTemplate, setLocalTemplate, localBroadcast, setLocalBroadcast } = useParticipantStore();
  const { uploadFiles, isUploading, progress } = useUploadFiles();
  const [title, setTitle] = useState(localBroadcast?.title || localTemplate?.title || "");

  // Reset form when dialog opens or broadcast/template changes
  useEffect(() => {
    if (open) {
      setTitle(localBroadcast?.title || localTemplate?.title || "");
      setDescription(localTemplate?.description || "");
      setThumbnailFile(null);
      setThumbnailPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open, localBroadcast, localTemplate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const preview = URL.createObjectURL(file);
      setThumbnailPreview(preview);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      let thumbnailUrl: string | undefined;

      // Upload thumbnail if a file was selected
      if (thumbnailFile && currentProfileAuthorization?.profileId) {
        const [fileResult] = await uploadFiles([thumbnailFile]);
        thumbnailUrl = fileResult.url;
      }

      if (localBroadcast) {
        // Update broadcast via API
        setLocalBroadcast({
          ...localBroadcast,
          title: title.trim(),
          description: description.trim() || localBroadcast.description,
          thumbnailUrl: thumbnailUrl || localBroadcast.thumbnailUrl,
        });
      } else if (localTemplate) {
        // Update local template without persisting to database
        setLocalTemplate(
          {
            ...localTemplate,
            title: title.trim(),
            description: description.trim() || localTemplate.description,
            thumbnailUrl: thumbnailUrl || localTemplate.thumbnailUrl,
          },
          false, // Don't persist to database
        );
      }

      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      const errorMessage = (error as ApiError).response?.data?.message || "Failed to update";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setTitle(localBroadcast?.title || localTemplate?.title || "");
    setDescription(localTemplate?.description || "");
    setThumbnailFile(null);
    setThumbnailPreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{"Update Broadcast"}</DialogTitle>
          <DialogDescription>Update the broadcast title, description, and thumbnail</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter broadcast title"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter broadcast description"
                rows={4}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <Input
                id="thumbnail"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {isUploading && <Progress value={progress} className="w-full" />}
              {thumbnailPreview && (
                <div className="relative w-full aspect-video border rounded-lg overflow-hidden">
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveThumbnail}
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting || isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              Update Broadcast
              {isSubmitting && <Loader2Icon className="w-4 h-4 animate-spin ml-2" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateBroadcastDialog;
