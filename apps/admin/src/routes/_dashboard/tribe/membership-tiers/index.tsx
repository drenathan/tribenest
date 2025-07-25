import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import { useMembershipTiers } from "@/hooks/queries/useMembershipTiers";
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/components/loading";
import EmptyState from "@/components/empty-state";
import { Button, type ApiError } from "@tribe-nest/frontend-shared";
import MembershipTierItem from "./-components/membership-tier-item";
import { MembershipTierBenefit } from "./-components/membership-tier-benefit";
import { EditMembershipTierDialog } from "./-components/edit-membership-tier-dialog";
import type { MembershipTier } from "@/types/membership";
import { useState, useRef } from "react";
import {
  useArchiveMembershipTier,
  useUnarchiveMembershipTier,
  useReorderMembershipTiers,
} from "@/hooks/mutations/useMembershipTier";
import { toast } from "sonner";

export const Route = createFileRoute("/_dashboard/tribe/membership-tiers/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const { data: membershipTiers, isLoading } = useMembershipTiers(currentProfileAuthorization?.profileId);
  const isEmpty = !isLoading && !membershipTiers?.length;

  const [selectedMembershipTier, setSelectedMembershipTier] = useState<MembershipTier>();
  const [isMembershipTierBenefitOpen, setIsMembershipTierBenefitOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [draggedTier, setDraggedTier] = useState<MembershipTier | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragOverItem = useRef<number | null>(null);
  const { mutateAsync: archiveMembershipTier } = useArchiveMembershipTier();
  const { mutateAsync: unarchiveMembershipTier } = useUnarchiveMembershipTier();
  const { mutateAsync: reorderMembershipTiers } = useReorderMembershipTiers();

  const handleEditClick = (membershipTier: MembershipTier) => {
    setSelectedMembershipTier(membershipTier);
    setIsEditDialogOpen(true);
  };

  const handleArchiveClick = async (membershipTier: MembershipTier) => {
    try {
      await archiveMembershipTier({ id: membershipTier.id, profileId: currentProfileAuthorization!.profileId });
      toast.success("Membership tier archived successfully");
    } catch (error) {
      const message = (error as ApiError).response?.data?.message;
      toast.error(message || "Failed to archive membership tier");
    }
  };

  const handleUnarchiveClick = async (membershipTier: MembershipTier) => {
    try {
      await unarchiveMembershipTier({ id: membershipTier.id, profileId: currentProfileAuthorization!.profileId });
      toast.success("Membership tier unarchived successfully");
    } catch (error) {
      const message = (error as ApiError).response?.data?.message;
      toast.error(message || "Failed to unarchive membership tier");
    }
  };

  const handleDragStart = (e: React.DragEvent, membershipTier: MembershipTier) => {
    setDraggedTier(membershipTier);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedTier(null);
    dragOverItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (!draggedTier || !membershipTiers || !currentProfileAuthorization?.profileId) return;

    const draggedIndex = membershipTiers.findIndex((tier) => tier.id === draggedTier.id);
    if (draggedIndex === -1 || draggedIndex === index) return;

    // Create new array with reordered items
    const newOrder = [...membershipTiers];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, removed);

    try {
      await reorderMembershipTiers({
        profileId: currentProfileAuthorization.profileId,
        membershipTierIds: newOrder.map((tier) => tier.id),
      });
      toast.success("Membership tiers reordered successfully");
    } catch (error) {
      const message = (error as ApiError).response?.data?.message;
      toast.error(message || "Failed to reorder membership tiers");
    }
  };

  return (
    <div>
      <PageHeader
        title="Membership Tiers"
        description="Manage your membership tiers and their benefits"
        action={
          !isEmpty && (
            <Button>
              <Link to="/tribe/membership-tiers/create">Create New</Link>
            </Button>
          )
        }
      />
      {isLoading && <Loading />}
      {isEmpty && (
        <EmptyState
          title="No membership tiers found"
          description="Create a membership tier to get started"
          action={
            <Button>
              <Link to="/tribe/membership-tiers/create">Create New</Link>
            </Button>
          }
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {membershipTiers?.map((membershipTier, index) => (
          <div
            key={membershipTier.id}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={`transition-all duration-200 ${dragOverItem.current === index && isDragging ? "scale-105" : ""}`}
          >
            <MembershipTierItem
              membershipTier={membershipTier}
              onAddBenefitClick={() => {
                setSelectedMembershipTier(membershipTier);
                setIsMembershipTierBenefitOpen(true);
              }}
              onEditClick={() => handleEditClick(membershipTier)}
              onArchiveClick={() => handleArchiveClick(membershipTier)}
              onUnarchiveClick={() => handleUnarchiveClick(membershipTier)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              isDragging={isDragging && draggedTier?.id === membershipTier.id}
            />
          </div>
        ))}
      </div>

      <MembershipTierBenefit
        isOpen={isMembershipTierBenefitOpen}
        onOpenChange={setIsMembershipTierBenefitOpen}
        membershipTier={selectedMembershipTier}
      />

      <EditMembershipTierDialog
        membershipTier={selectedMembershipTier}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
