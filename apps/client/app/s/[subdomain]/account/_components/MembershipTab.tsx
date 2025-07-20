"use client";

import { usePublicAuth, useEditorContext, alphaToHexCode, Badge } from "@tribe-nest/frontend-shared";
import { Crown, Calendar } from "lucide-react";

export function MembershipTab() {
  const { user } = usePublicAuth();
  const { themeSettings } = useEditorContext();

  return (
    <div
      className="border rounded-lg p-6"
      style={{
        borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
        backgroundColor: themeSettings.colors.background,
      }}
    >
      <div className="mb-4">
        <h3
          className="flex items-center gap-2 text-lg font-semibold"
          style={{ color: themeSettings.colors.textPrimary }}
        >
          <Crown className="w-5 h-5" style={{ color: themeSettings.colors.primary }} />
          Current Membership
        </h3>
      </div>
      <div className="space-y-4">
        {user?.membership ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold" style={{ color: themeSettings.colors.textPrimary }}>
                  {user.membership.membershipTierId ? "Premium Member" : "Basic Member"}
                </h3>
                <p style={{ color: themeSettings.colors.text }}>Access to exclusive content and features</p>
              </div>
              <Badge
                className="px-3 py-1"
                style={{
                  backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
                  color: themeSettings.colors.primary,
                }}
              >
                Active
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: themeSettings.colors.text }} />
              <span style={{ color: themeSettings.colors.text }}>
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Crown className="w-12 h-12 mx-auto mb-4" style={{ color: themeSettings.colors.text }} />
            <h3 className="font-semibold mb-2" style={{ color: themeSettings.colors.textPrimary }}>
              No Active Membership
            </h3>
            <p style={{ color: themeSettings.colors.text }}>
              You don't have an active membership. Join a tier to access exclusive content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
