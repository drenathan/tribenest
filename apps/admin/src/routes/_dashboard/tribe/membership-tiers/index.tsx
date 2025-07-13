import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import { useMembershipTiers } from "@/hooks/queries/useMembershipTiers";
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/components/loading";
import EmptyState from "@/components/empty-state";
import { Button } from "@tribe-nest/frontend-shared";
import MembershipTierItem from "./-components/membership-tier-item";
import { MembershipTierBenefit } from "./-components/membership-tier-benefit";
import type { MembershipTier } from "@/types/membership";
import { useState } from "react";
export const Route = createFileRoute("/_dashboard/tribe/membership-tiers/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const { data: membershipTiers, isLoading } = useMembershipTiers(currentProfileAuthorization?.profileId);
  const isEmpty = !isLoading && !membershipTiers?.length;
  const [selectedMembershipTier, setSelectedMembershipTier] = useState<MembershipTier>();
  const [isMembershipTierBenefitOpen, setIsMembershipTierBenefitOpen] = useState(false);

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
        {membershipTiers?.map((membershipTier) => (
          <MembershipTierItem
            key={membershipTier.id}
            membershipTier={membershipTier}
            onAddBenefitClick={() => {
              setSelectedMembershipTier(membershipTier);
              setIsMembershipTierBenefitOpen(true);
            }}
          />
        ))}
      </div>

      <MembershipTierBenefit
        isOpen={isMembershipTierBenefitOpen}
        onOpenChange={setIsMembershipTierBenefitOpen}
        membershipTier={selectedMembershipTier}
      />
    </div>
  );
}
