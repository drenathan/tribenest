import { Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@tribe-nest/frontend-shared";
import type { MembershipBenefit, MembershipTier } from "@/types/membership";
import EmptyState from "@/components/empty-state";
import { useEffect, useState } from "react";
import { AddBenefit } from "./add-benefit";
import { useGetMembershipBenefits } from "@/hooks/queries/useMembershipTiers";
import { useAuth } from "@/hooks/useAuth";
import { DialogActions } from "@mui/material";
import { useUpdateMembershipTierBenefits } from "@/hooks/mutations/useMembershipTier";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  membershipTier?: MembershipTier;
};

export function MembershipTierBenefit({ isOpen, onOpenChange, membershipTier }: Props) {
  const [isAddBenefitOpen, setIsAddBenefitOpen] = useState(false);
  const { currentProfileAuthorization } = useAuth();
  const { data: membershipBenefits, isLoading } = useGetMembershipBenefits(currentProfileAuthorization?.profile.id);
  const [localBenefits, setLocalBenefits] = useState<MembershipBenefit[]>([]);
  const { mutateAsync: updateMembershipTierBenefits } = useUpdateMembershipTierBenefits();

  useEffect(() => {
    if (membershipTier) {
      setLocalBenefits(membershipTier.benefits);
    }
  }, [membershipTier]);

  if (!membershipTier || isLoading || !currentProfileAuthorization) return null;

  const handleAddBenefit = (benefit: MembershipBenefit) => {
    setIsAddBenefitOpen(false);
    setLocalBenefits([...localBenefits, benefit]);
  };

  const isEmptyBenefits = !membershipBenefits?.length;

  const handleSave = async () => {
    await updateMembershipTierBenefits({
      tierId: membershipTier.id,
      benefits: localBenefits.map((b) => b.id),
      profileId: currentProfileAuthorization.profile.id,
    });
    toast.success("Benefits updated successfully");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Benefits for {membershipTier.name}</DialogTitle>
            <DialogDescription>
              {!isEmptyBenefits && (
                <Button variant="outline" className="mt-2" onClick={() => setIsAddBenefitOpen(true)}>
                  Add Benefit
                </Button>
              )}
            </DialogDescription>
          </DialogHeader>

          <div>
            {isEmptyBenefits && (
              <EmptyState
                title="No benefits found"
                description="Add a benefit to your membership tier"
                action={<Button onClick={() => setIsAddBenefitOpen(true)}>Add Benefit</Button>}
              />
            )}
            <div className="flex flex-col gap-2">
              {membershipBenefits?.map((benefit) => (
                <div key={benefit.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id={benefit.id}
                    className="cursor-pointer"
                    checked={!!localBenefits.find((b) => b.id === benefit.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setLocalBenefits([...localBenefits, benefit]);
                      } else {
                        setLocalBenefits(localBenefits.filter((b) => b.id !== benefit.id));
                      }
                    }}
                  />
                  <label htmlFor={benefit.id} className="cursor-pointer">
                    {benefit.title}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {!isEmptyBenefits && (
            <DialogActions>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSave()}>Save</Button>
            </DialogActions>
          )}
        </DialogContent>
      </Dialog>
      <AddBenefit isOpen={isAddBenefitOpen} onOpenChange={setIsAddBenefitOpen} onSuccess={handleAddBenefit} />
    </>
  );
}
