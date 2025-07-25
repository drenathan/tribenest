"use client";

import {
  usePublicAuth,
  useEditorContext,
  alphaToHexCode,
  Badge,
  EditorButtonWithoutEditor,
  EditorModal,
  ApiError,
} from "@tribe-nest/frontend-shared";
import { Crown, Calendar, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function MembershipTab() {
  const { user } = usePublicAuth();
  const { themeSettings, navigate, httpClient, profile } = useEditorContext();
  const [isCancelMembershipModalOpen, setIsCancelMembershipModalOpen] = useState(false);
  const isFreeMembership =
    user?.membership?.membershipTier.priceMonthly === 0 && !user?.membership?.membershipTier.payWhatYouWantMinimum;
  const [isLoading, setIsLoading] = useState(false);

  const isCancelableMembership = !isFreeMembership && user?.membership?.status === "active";

  if (!httpClient) {
    return null;
  }

  const handleCancelMembership = async () => {
    if (!user?.membership?.id) {
      toast.error("No membership found");
      return;
    }
    setIsLoading(true);

    try {
      await httpClient.post("/public/payments/subscriptions/cancel", {
        membershipId: user?.membership?.id,
        profileId: profile?.id,
      });
      toast.success("Membership cancelled");
    } catch (error) {
      const message = (error as ApiError)?.response?.data?.message;
      toast.error(message || "Failed to cancel membership");
    } finally {
      setIsCancelMembershipModalOpen(false);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="border rounded-lg p-6"
      style={{
        borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
        backgroundColor: themeSettings.colors.background,
        color: themeSettings.colors.text,
      }}
    >
      {user?.membership && (
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Crown className="w-5 h-5" style={{ color: themeSettings.colors.primary }} />
            Current Membership
          </h3>
          <Badge
            className="px-3 py-1 mt-2 ml-2"
            style={{
              backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
              color: themeSettings.colors.primary,
            }}
          >
            {user?.membership?.status === "active" ? "Active" : "Cancelled"}
          </Badge>
        </div>
      )}
      <div className="space-y-4">
        {user?.membership ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">{user.membership.membershipTier.name}</h3>
                {user.membership.subscriptionAmount && (
                  <p className="text-sm text-muted-foreground mb-2">
                    ${user.membership.subscriptionAmount} / {user.membership.billingCycle}
                  </p>
                )}
                {user.membership?.membershipTier?.benefits.map((benefit) => (
                  <p key={benefit.id} className="flex items-center gap-2" style={{ color: themeSettings.colors.text }}>
                    <CheckCircle className="w-4 h-4" style={{ color: themeSettings.colors.primary }} />
                    {benefit.title}
                  </p>
                ))}
              </div>
            </div>

            {user.membership?.endDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: themeSettings.colors.text }} />
                <span style={{ color: themeSettings.colors.text }}>
                  {user.membership?.status === "active"
                    ? `Renews on ${new Date(user.membership?.endDate).toLocaleDateString()}`
                    : `Ends on ${new Date(user.membership?.endDate).toLocaleDateString()}`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Crown className="w-12 h-12 mx-auto mb-4" style={{ color: themeSettings.colors.text }} />
            <h3 className="font-semibold mb-2">No Active Membership</h3>
            <p style={{ color: themeSettings.colors.text }}>
              You don&apos;t have an active membership. Join a tier to access exclusive content.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        {isCancelableMembership && (
          <EditorButtonWithoutEditor
            text="Cancel"
            onClick={() => setIsCancelMembershipModalOpen(true)}
            variant="secondary"
          />
        )}
        <EditorButtonWithoutEditor
          text={user?.membership ? "Change" : "Join"}
          onClick={() => navigate("/membership/checkout")}
        />
      </div>

      <EditorModal
        isOpen={isCancelMembershipModalOpen}
        onClose={() => setIsCancelMembershipModalOpen(false)}
        title="Cancel Membership"
        content={<div>Are you sure you want to cancel your membership?</div>}
        footer={
          <div className="flex justify-end gap-4">
            <EditorButtonWithoutEditor disabled={isLoading} text="Cancel" onClick={handleCancelMembership} />
          </div>
        }
      />
    </div>
  );
}
