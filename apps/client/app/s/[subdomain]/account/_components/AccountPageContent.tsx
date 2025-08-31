"use client";

import { InternalPageRenderer } from "../../_components/internal-page-renderer";
import { ProtectedRoute } from "../../_components/protected-route";
import {
  usePublicAuth,
  useEditorContext,
  alphaToHexCode,
  EditorButtonWithoutEditor,
} from "@tribe-nest/frontend-shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tribe-nest/frontend-shared";
import { Crown, CreditCard, Bookmark, User } from "lucide-react";
import { MembershipTab } from "./MembershipTab";
import { OrdersTab } from "./OrdersTab";
import { SavedTab } from "./SavedTab";
import { AccountTab } from "./AccountTab";
import { useSearchParams } from "next/navigation";
import { usePublicAuthGuard } from "../../_hooks/usePublicAuthGuard";
import { usePWA } from "@/lib/hooks/usePWA";

export function AccountPageContent() {
  usePublicAuthGuard();
  const { isAuthenticated } = usePublicAuth();
  const { themeSettings, navigate } = useEditorContext();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "membership";
  const { isInstalled, isInstallable, installPWA } = usePWA();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProtectedRoute>
      <InternalPageRenderer pagePathname="/account">
        <div className="w-full max-w-6xl mx-auto p-4 @md:p-6 @lg:p-8">
          <div className="mb-8">
            <h1
              className="text-2xl @md:text-3xl @lg:text-4xl font-bold mb-2"
              style={{ color: themeSettings.colors.text }}
            >
              My Account
            </h1>
            <p style={{ color: themeSettings.colors.text }} className="mb-4">
              Manage your membership, orders, saved content, and account details
            </p>

            {!isInstalled && isInstallable && <EditorButtonWithoutEditor onClick={installPWA} text="Install App" />}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              navigate(`/account?tab=${value}`);
            }}
            className="w-full"
          >
            <TabsList
              className="grid w-full grid-cols-2 @md:grid-cols-4 mb-8 gap-4 border rounded-lg p-2"
              style={{
                backgroundColor: `${themeSettings.colors.background}${alphaToHexCode(0.1)}`,
                border: "none",
              }}
            >
              <TabsTrigger
                value="membership"
                className="flex items-center gap-2 @md:gap-3"
                style={{ color: themeSettings.colors.text }}
              >
                <Crown className="w-4 h-4 @md:w-5 @md:h-5" />
                <span className="text-xs @md:text-sm">Membership</span>
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="flex items-center gap-2 @md:gap-3"
                style={{ color: themeSettings.colors.text }}
              >
                <CreditCard className="w-4 h-4 @md:w-5 @md:h-5" />
                <span className="text-xs @md:text-sm">Orders</span>
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="flex items-center gap-2 @md:gap-3"
                style={{ color: themeSettings.colors.text }}
              >
                <Bookmark className="w-4 h-4 @md:w-5 @md:h-5" />
                <span className="text-xs @md:text-sm">Saved</span>
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="flex items-center gap-2 @md:gap-3"
                style={{ color: themeSettings.colors.text }}
              >
                <User className="w-4 h-4 @md:w-5 @md:h-5" />
                <span className="text-xs @md:text-sm">Account</span>
              </TabsTrigger>
            </TabsList>

            {/* Membership Tab */}
            <TabsContent value="membership" className="space-y-6">
              <MembershipTab />
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <OrdersTab />
            </TabsContent>

            {/* Saved Tab */}
            <TabsContent value="saved" className="space-y-6">
              <SavedTab />
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <AccountTab />
            </TabsContent>
          </Tabs>
        </div>
      </InternalPageRenderer>
    </ProtectedRoute>
  );
}
