import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FormInput,
  type EditorTheme,
} from "@tribe-nest/frontend-shared";
import { useCreateSmartLink } from "@/hooks/mutations/useSmartLink";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";

// Form validation schema
const createSmartLinkSchema = z.object({
  title: z.string().min(8, "Title must be at least 8 characters long"),
  description: z.string().max(150, "Description must be at most 150 characters").optional(),
  path: z
    .string()
    .min(1, "Path is required")
    .regex(/^[a-z0-9-]+$/, "Path can only contain lowercase letters, numbers, and hyphens"),
});

type CreateSmartLinkFormData = z.infer<typeof createSmartLinkSchema>;

interface CreateSmartLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content?: string;
  themeSettings: EditorTheme;
  template?: string;
}

export const CreateSmartLinkDialog = ({
  open,
  onOpenChange,
  content,
  themeSettings,
  template,
}: CreateSmartLinkDialogProps) => {
  const { currentProfileAuthorization } = useAuth();
  const createSmartLink = useCreateSmartLink();
  const navigate = useNavigate();

  const { control, handleSubmit, reset, watch, setValue } = useForm<CreateSmartLinkFormData>({
    resolver: zodResolver(createSmartLinkSchema),
    defaultValues: {
      title: "",
      description: "",
      path: "",
    },
  });

  const description = watch("description") || "";

  const onSubmit = async (data: CreateSmartLinkFormData) => {
    if (!currentProfileAuthorization) {
      return;
    }

    try {
      await createSmartLink.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        path: data.path,
        content,
        themeSettings,
        profileId: currentProfileAuthorization.profileId,
        template,
      });

      // Reset form
      reset();

      // Close dialog
      onOpenChange(false);

      // Navigate to smart links list
      navigate({ to: "/smart-links/links" });
    } catch (error) {
      console.error("Failed to create smart link:", error);
    }
  };

  const handlePathChange = (value: string) => {
    // Convert to slug format
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Update the form field with the transformed value
    setValue("path", slug);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Smart Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput control={control} name="title" label="Title *" placeholder="Enter smart link title" />

          <FormInput
            control={control}
            name="description"
            label="Description"
            placeholder="Enter description (optional)"
            textArea
          />
          <p className="text-xs text-muted-foreground">{description.length}/150 characters</p>

          <FormInput
            control={control}
            name="path"
            label="Path *"
            placeholder="my-smart-link"
            onChange={(value) => handlePathChange(value)}
          />
          <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, and hyphens allowed</p>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createSmartLink.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createSmartLink.isPending}>
              {createSmartLink.isPending ? "Creating..." : "Create Smart Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
