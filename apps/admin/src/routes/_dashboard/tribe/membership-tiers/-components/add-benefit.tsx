import { useCreateMembershipBenefit } from "@/hooks/mutations/useMembershipTier";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FormError,
  FormInput,
  type ApiError,
} from "@tribe-nest/frontend-shared";
import { useForm } from "react-hook-form";
import { createMembershipBenefitResolver, type CreateMembershipBenefitInput } from "./schema";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import type { MembershipBenefit } from "@/types/membership";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (benefit: MembershipBenefit) => void;
};

export function AddBenefit({ isOpen, onOpenChange, onSuccess }: Props) {
  const { mutateAsync: createMembershipBenefit, isPending } = useCreateMembershipBenefit();
  const { currentProfileAuthorization } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  const methods = useForm<CreateMembershipBenefitInput>({
    resolver: createMembershipBenefitResolver,
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateMembershipBenefitInput) => {
    try {
      const result = await createMembershipBenefit({ ...data, profileId: currentProfileAuthorization?.profileId });
      onSuccess(result);
    } catch (e: unknown) {
      const error = e as ApiError;
      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-6">
        <DialogHeader>
          <DialogTitle>Create Benefit</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div>
          {errorMessage && <FormError message={errorMessage} />}
          <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-2xl flex flex-col gap-6 mt-2">
            <FormInput<CreateMembershipBenefitInput>
              name="title"
              label="Title"
              control={methods.control}
              placeholder="eg. Free access to the live shows backstage"
            />

            <FormInput<CreateMembershipBenefitInput>
              name="description"
              label="Description (optional)"
              control={methods.control}
              textArea={true}
              placeholder="Enter the description of the membership benefit"
            />

            <Button className="w-fit" type="submit" disabled={isPending}>
              Create Membership Benefit
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
