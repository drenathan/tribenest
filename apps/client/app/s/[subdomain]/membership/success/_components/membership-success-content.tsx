"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useEditorContext, alphaToHexCode } from "@tribe-nest/frontend-shared";
import { EditorButtonWithoutEditor } from "@tribe-nest/frontend-shared";
import { CheckCircle, Loader2 } from "lucide-react";

export function MembershipSuccessContent() {
  const { themeSettings, navigate, httpClient, profile } = useEditorContext();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const paymentProviderName = searchParams.get("paymentProviderName");
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (paymentId && paymentProviderName && profile) {
      // Process the payment and create membership
      httpClient!
        .post("/public/membership/finalize", {
          paymentId,
          paymentProviderName,
          profileId: profile.id,
        })
        .then(() => {
          setIsSuccess(true);
          setIsProcessing(false);
        })
        .catch((err: any) => {
          setError(err?.response?.data?.message || "Failed to process payment");
          setIsProcessing(false);
        });
    } else {
      setIsProcessing(false);
    }
  }, [paymentId, paymentProviderName, profile, httpClient]);

  if (isProcessing) {
    return (
      <div
        className="w-full max-w-4xl mx-auto p-6"
        style={{
          backgroundColor: themeSettings.colors.background,
          color: themeSettings.colors.text,
          fontFamily: themeSettings.fontFamily,
        }}
      >
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: themeSettings.colors.primary }} />
          <h1 className="text-2xl font-bold mb-4">Processing your membership...</h1>
          <p className="text-lg">Please wait while we set up your membership.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="w-full max-w-4xl mx-auto p-6"
        style={{
          backgroundColor: themeSettings.colors.background,
          color: themeSettings.colors.text,
          fontFamily: themeSettings.fontFamily,
        }}
      >
        <div className="text-center py-12">
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
          >
            <span className="text-2xl">×</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Payment Processing Error</h1>
          <p className="text-lg mb-6">{error}</p>
          <EditorButtonWithoutEditor text="Go Back Home" onClick={() => navigate("/")} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-4xl mx-auto p-6"
      style={{
        backgroundColor: themeSettings.colors.background,
        color: themeSettings.colors.text,
        fontFamily: themeSettings.fontFamily,
      }}
    >
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 mx-auto mb-6" style={{ color: "#10b981" }} />
        <h1 className="text-3xl font-bold mb-4">Welcome to the Tribe!</h1>
        <p className="text-lg mb-8">
          Your membership has been successfully activated. You now have access to all the exclusive content and
          benefits.
        </p>

        <div
          className="max-w-md mx-auto mb-8 p-6 rounded-lg"
          style={{ border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.3)}` }}
        >
          <h3 className="text-lg font-bold mb-4">What's Next?</h3>
          <ul className="text-left space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" style={{ color: "#10b981" }} />
              <span>Explore exclusive content</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" style={{ color: "#10b981" }} />
              <span>Connect with other members</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" style={{ color: "#10b981" }} />
              <span>Access member-only features</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <EditorButtonWithoutEditor text="Start Exploring" onClick={() => navigate("/")} />
          <EditorButtonWithoutEditor text="View My Membership" onClick={() => navigate("/account")} />
        </div>
      </div>
    </div>
  );
}
