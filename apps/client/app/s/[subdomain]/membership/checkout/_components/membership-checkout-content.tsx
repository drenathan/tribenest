"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePublicAuth, useEditorContext, alphaToHexCode } from "@tribe-nest/frontend-shared";
import { EditorButtonWithoutEditor } from "@tribe-nest/frontend-shared";
import type { MembershipTier } from "@tribe-nest/frontend-shared";

type Stage = "selection" | "details" | "payment";
type PaymentCycle = "monthly" | "yearly";

export function MembershipCheckoutContent() {
  const { user, isAuthenticated } = usePublicAuth();
  const { themeSettings, navigate, httpClient, profile } = useEditorContext();
  const searchParams = useSearchParams();
  const membershipTierId = searchParams.get("membershipTierId");

  const [currentStage, setCurrentStage] = useState<Stage>("selection");
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [paymentCycle, setPaymentCycle] = useState<PaymentCycle>("monthly");
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch membership tiers
  useEffect(() => {
    if (httpClient && profile) {
      httpClient
        .get(`/public/membership-tiers`, {
          params: { profileId: profile.id },
        })
        .then((res) => {
          setMembershipTiers(res.data);

          // If membershipTierId is provided, find and select that tier
          if (membershipTierId) {
            const tier = res.data.find((t: MembershipTier) => t.id === membershipTierId);
            if (tier) {
              setSelectedTier(tier);
              setCurrentStage("details");
              if (tier.payWhatYouWant && tier.payWhatYouWantMinimum) {
                setCustomAmount(tier.payWhatYouWantMinimum);
              }
            }
          }

          setIsLoading(false);
        })
        .catch(() => {
          navigate("/");
        });
    }
  }, [membershipTierId, httpClient, profile, navigate]);

  const handleTierSelect = (tier: MembershipTier) => {
    setSelectedTier(tier);
    if (tier.payWhatYouWant && tier.payWhatYouWantMinimum) {
      setCustomAmount(tier.payWhatYouWantMinimum);
    }
    setCurrentStage("details");
  };

  const handleBackToSelection = () => {
    setSelectedTier(null);
    setCurrentStage("selection");
  };

  const handleProceedToPayment = () => {
    setCurrentStage("payment");
  };

  const getTierPrice = (tier: MembershipTier) => {
    if (tier.payWhatYouWant) {
      return `Pay What You Want from $${tier.payWhatYouWantMinimum}/Mo`;
    }

    if (paymentCycle === "monthly") {
      return tier.priceMonthly ? `$${tier.priceMonthly}/Mo` : "Free";
    } else {
      return tier.priceYearly ? `$${tier.priceYearly}/Yr` : "Free";
    }
  };

  if (isLoading) {
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
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderColor: themeSettings.colors.primary }}
          ></div>
          <p>Loading membership tiers...</p>
        </div>
      </div>
    );
  }

  if (membershipTiers.length === 0) {
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
          <h1 className="text-2xl font-bold mb-4">No memberships available</h1>
          <p className="mb-6">There are no membership tiers available at the moment.</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: themeSettings.colors.primary,
              color: themeSettings.colors.background,
            }}
          >
            Go Back Home
          </button>
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
      {/* Stage 1: Membership Tier Selection */}
      {currentStage === "selection" && (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Choose Your Membership</h1>
            <p className="text-center text-lg opacity-75">Select the membership tier that's right for you</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {membershipTiers.map((tier) => (
              <div
                key={tier.id}
                className="p-6 rounded-lg cursor-pointer transition-all hover:scale-105"
                style={{
                  border: `2px solid ${themeSettings.colors.primary}${alphaToHexCode(0.3)}`,
                  backgroundColor: `${themeSettings.colors.background}`,
                }}
                onClick={() => handleTierSelect(tier)}
              >
                <h3 className="text-xl font-bold text-center mb-4">{tier.name}</h3>

                <div className="text-center mb-4">
                  {tier.payWhatYouWant ? (
                    <p className="text-lg font-semibold">Pay What You Want from ${tier.payWhatYouWantMinimum}/Mo</p>
                  ) : (
                    <p className="text-lg font-semibold">
                      {tier.priceMonthly ? `$${tier.priceMonthly}/Mo` : "Free"}
                      {tier.priceYearly ? ` or $${tier.priceYearly}/Yr` : ""}
                    </p>
                  )}
                </div>

                {tier.benefits && tier.benefits.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Benefits:</h4>
                    <ul className="space-y-1">
                      {tier.benefits.slice(0, 3).map((benefit) => (
                        <li key={benefit.id} className="flex items-center gap-2 text-sm">
                          <span className="text-green-500">✓</span>
                          {benefit.title}
                        </li>
                      ))}
                      {tier.benefits.length > 3 && (
                        <li className="text-xs opacity-75">+{tier.benefits.length - 3} more benefits</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="text-center">
                  <EditorButtonWithoutEditor text="Select This Tier" onClick={() => handleTierSelect(tier)} fullWidth />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage 2: Tier Details and Options */}
      {currentStage === "details" && selectedTier && (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Join {selectedTier.name}</h1>
            <p className="text-center text-lg opacity-75">Review your selection and choose your options</p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Tier Information */}
            <div
              className="mb-8 p-6 rounded-lg"
              style={{ border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.3)}` }}
            >
              <h2 className="text-2xl font-bold mb-4">{selectedTier.name}</h2>
              <p className="text-lg mb-4">{selectedTier.description}</p>

              {/* Benefits */}
              {selectedTier.benefits && selectedTier.benefits.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">What you'll get:</h3>
                  <ul className="space-y-2">
                    {selectedTier.benefits.map((benefit) => (
                      <li key={benefit.id} className="flex items-center gap-3">
                        <span className="text-green-500 text-lg">✓</span>
                        <div>
                          <p className="font-medium">{benefit.title}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Payment Options */}
            <div
              className="mb-8 p-6 rounded-lg"
              style={{ border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.3)}` }}
            >
              <h3 className="text-lg font-semibold mb-4">Payment Options</h3>

              {/* Pay What You Want Amount Input */}
              {selectedTier.payWhatYouWant && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    How much would you like to pay? (Min: ${selectedTier.payWhatYouWantMinimum})
                  </label>
                  <input
                    type="number"
                    min={selectedTier.payWhatYouWantMinimum}
                    max={selectedTier.payWhatYouWantMaximum}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="w-full p-3 rounded border"
                    style={{
                      borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.4)}`,
                      backgroundColor: themeSettings.colors.background,
                      color: themeSettings.colors.text,
                    }}
                  />
                </div>
              )}

              {/* Payment Cycle Selection */}
              {!selectedTier.payWhatYouWant && (selectedTier.priceMonthly || selectedTier.priceYearly) && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Billing Cycle</label>
                  <div className="flex gap-4">
                    {selectedTier.priceMonthly ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentCycle"
                          value="monthly"
                          checked={paymentCycle === "monthly"}
                          onChange={() => setPaymentCycle("monthly")}
                          className="w-4 h-4"
                          style={{ accentColor: themeSettings.colors.primary }}
                        />
                        <span>Monthly (${selectedTier.priceMonthly})</span>
                      </label>
                    ) : null}
                    {selectedTier.priceYearly ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentCycle"
                          value="yearly"
                          checked={paymentCycle === "yearly"}
                          onChange={() => setPaymentCycle("yearly")}
                          className="w-4 h-4"
                          style={{ accentColor: themeSettings.colors.primary }}
                        />
                        <span>Yearly (${selectedTier.priceYearly})</span>
                      </label>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Total Amount Display */}
              <div
                className="text-center py-4 border-t"
                style={{ borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}` }}
              >
                <p className="text-sm opacity-75">Total Amount</p>
                <p className="text-3xl font-bold">
                  {selectedTier.payWhatYouWant ? `$${customAmount}` : getTierPrice(selectedTier)}
                </p>
                <p className="text-sm opacity-75">
                  {selectedTier.payWhatYouWant ? "per month" : paymentCycle === "monthly" ? "per month" : "per year"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <EditorButtonWithoutEditor text="Back to Selection" onClick={handleBackToSelection} />
              <EditorButtonWithoutEditor text="Proceed to Payment" onClick={handleProceedToPayment} />
            </div>
          </div>
        </div>
      )}

      {/* Stage 3: Payment (Empty for now) */}
      {currentStage === "payment" && selectedTier && (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Payment</h1>
            <p className="text-center text-lg opacity-75">Payment stage - to be implemented</p>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <div
              className="p-8 rounded-lg"
              style={{ border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.3)}` }}
            >
              <p className="text-lg mb-4">Payment integration will be implemented here.</p>
              <p className="mb-6 opacity-75">
                Selected: {selectedTier.name} - {getTierPrice(selectedTier)}
              </p>

              <div className="flex gap-4 justify-center">
                <EditorButtonWithoutEditor text="Back to Details" onClick={() => setCurrentStage("details")} />
                <EditorButtonWithoutEditor text="Back to Selection" onClick={handleBackToSelection} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
