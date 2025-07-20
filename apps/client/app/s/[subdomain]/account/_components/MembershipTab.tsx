"use client";

import {
  usePublicAuth,
  useEditorContext,
  alphaToHexCode,
  Badge,
  EditorButtonWithoutEditor,
} from "@tribe-nest/frontend-shared";
import { Crown, Calendar, CheckCircle } from "lucide-react";

export function MembershipTab() {
  const { user } = usePublicAuth();
  const { themeSettings, navigate } = useEditorContext();

  return (
    <div
      className="border rounded-lg p-6"
      style={{
        borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
        backgroundColor: themeSettings.colors.background,
        color: themeSettings.colors.text,
      }}
    >
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
          Active
        </Badge>
      </div>
      <div className="space-y-4">
        {user?.membership ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">{user.membership.membershipTier.name}</h3>
                {user.membership?.membershipTier?.benefits.map((benefit) => (
                  <p key={benefit.id} className="flex items-center gap-2" style={{ color: themeSettings.colors.text }}>
                    <CheckCircle className="w-4 h-4" style={{ color: themeSettings.colors.primary }} />
                    {benefit.title}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: themeSettings.colors.text }} />
              <span style={{ color: themeSettings.colors.text }}>
                Member since {new Date(user.membership?.startDate).toLocaleDateString()}
              </span>
            </div>
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
        <EditorButtonWithoutEditor text="Cancel" onClick={() => navigate("/membership/checkout")} variant="secondary" />
        <EditorButtonWithoutEditor text="Change" onClick={() => navigate("/membership/checkout")} />
      </div>
    </div>
  );
}
