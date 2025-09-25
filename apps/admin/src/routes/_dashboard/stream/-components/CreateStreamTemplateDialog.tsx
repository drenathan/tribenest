import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  FormInput,
  FontFamily,
} from "@tribe-nest/frontend-shared";
import { useCreateStreamTemplate } from "@/hooks/mutations/useStreamTemplates";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { ApiError } from "@tribe-nest/frontend-shared";
import { sampleBanner, sampleTicker } from "./store";
import { COLORS } from "@/services/contants";
import { SceneLayout, SceneType } from "@/types/event";

const createStreamTemplateSchema = z.object({
  title: z.string().min(1, "Template title is required"),
});

type CreateStreamTemplateFormData = z.infer<typeof createStreamTemplateSchema>;

interface CreateStreamTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateStreamTemplateDialog = ({ open, onOpenChange }: CreateStreamTemplateDialogProps) => {
  const { currentProfileAuthorization } = useAuth();
  const createStreamTemplate = useCreateStreamTemplate();
  const navigate = useNavigate();

  const { handleSubmit, reset, control } = useForm<CreateStreamTemplateFormData>({
    resolver: zodResolver(createStreamTemplateSchema),
    defaultValues: {
      title: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: CreateStreamTemplateFormData) => {
    if (!currentProfileAuthorization?.profileId) {
      toast.error("Profile not found");
      return;
    }

    try {
      const newTemplate = await createStreamTemplate.mutateAsync({
        title: data.title.trim(),
        description: "", // Empty description for now
        profileId: currentProfileAuthorization.profileId,
        config: {
          banners: [sampleBanner],
          tickers: [sampleTicker],
          primaryColor: COLORS.primary,
          fontFamily: FontFamily.Inter,
          selectedSceneId: "1",
        },
        scenes: [
          {
            id: "1",
            title: "Scene 1",
            layout: SceneLayout.Solo,
            type: SceneType.Camera,
          },
        ],
      });

      toast.success("Template created successfully");
      onOpenChange(false);

      // Navigate to the template studio page
      navigate({
        to: "/stream/$templateId/studio",
        params: { templateId: newTemplate.id },
      });
    } catch (error) {
      const message = (error as ApiError)?.response?.data?.message;
      toast.error(message || "Failed to create template");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <FormInput name="title" label="Title" control={control} placeholder="Saturday night live" />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createStreamTemplate.isPending}>
              {createStreamTemplate.isPending ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
