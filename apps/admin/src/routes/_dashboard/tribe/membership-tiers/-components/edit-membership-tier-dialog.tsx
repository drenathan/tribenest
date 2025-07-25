import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  type ApiError,
} from "@tribe-nest/frontend-shared";
import { useUpdateMembershipTier } from "@/hooks/mutations/useMembershipTier";
import type { MembershipTier } from "@/types/membership";
import { useAuth } from "@/hooks/useAuth";

const editMembershipTierSchema = z.object({
  name: z.string().min(5, "Name must be at least 5 characters").max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
});

type EditMembershipTierInput = z.infer<typeof editMembershipTierSchema>;

type Props = {
  membershipTier: MembershipTier | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditMembershipTierDialog({ membershipTier, isOpen, onOpenChange }: Props) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: updateMembershipTier, isPending } = useUpdateMembershipTier();
  const { currentProfileAuthorization } = useAuth();

  const methods = useForm<EditMembershipTierInput>({
    resolver: zodResolver(editMembershipTierSchema),
    defaultValues: {
      name: membershipTier?.name || "",
      description: membershipTier?.description || "",
    },
  });

  useEffect(() => {
    if (membershipTier) {
      methods.reset({
        name: membershipTier.name,
        description: membershipTier.description,
      });
    }
  }, [membershipTier, methods]);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!membershipTier) return;

    try {
      setErrorMessage(null);
      await updateMembershipTier({
        id: membershipTier.id,
        name: data.name,
        description: data.description,
        profileId: currentProfileAuthorization!.profileId,
      });
      onOpenChange(false);
      methods.reset();
    } catch (error) {
      const message = (error as ApiError).response?.data?.message;
      setErrorMessage(message || "Failed to update membership tier");
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Membership Tier</DialogTitle>
          <DialogDescription>Update the name and description of your membership tier.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...methods.register("name")} placeholder="Enter membership tier name" />
            {methods.formState.errors.name && (
              <div className="text-sm text-red-600 dark:text-red-400">{methods.formState.errors.name.message}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...methods.register("description")}
              placeholder="Enter membership tier description"
              rows={3}
            />
            {methods.formState.errors.description && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {methods.formState.errors.description.message}
              </div>
            )}
          </div>

          {errorMessage && <div className="text-sm text-red-600 dark:text-red-400">{errorMessage}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
