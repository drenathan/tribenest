"use client";

import { useState, useRef, useCallback } from "react";
import { usePublicAuth, useEditorContext, alphaToHexCode, PaymentProviderName } from "@tribe-nest/frontend-shared";
import { EditorButtonWithoutEditor, EditorInputWithoutEditor } from "@tribe-nest/frontend-shared";
import { useForm, Controller } from "react-hook-form";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import type { MembershipTier, PublicAuthUser } from "@tribe-nest/frontend-shared";
import { toast } from "sonner";

type PaymentCycle = "monthly" | "yearly";
type PaymentMode = "fixed" | "payWhatYouWant";

interface MembershipPaymentStageProps {
  membershipTier: MembershipTier;
  user: PublicAuthUser;
}

export function MembershipPaymentStage({ membershipTier, user }: MembershipPaymentStageProps) {
  const { themeSettings, profile, navigate, httpClient } = useEditorContext();
  const [paymentCycle, setPaymentCycle] = useState<PaymentCycle>("monthly");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    membershipTier.payWhatYouWant ? "payWhatYouWant" : "fixed",
  );
  const [customAmount, setCustomAmount] = useState(
    membershipTier.payWhatYouWant ? membershipTier.payWhatYouWantMinimum || 0 : 0,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const stripePromise = useRef(loadStripe(profile!.paymentProviderPublicKey));

  // Calculate the amount based on payment mode and cycle
  const getAmount = () => {
    if (paymentMode === "payWhatYouWant") {
      return customAmount;
    }

    if (paymentCycle === "monthly") {
      return membershipTier.priceMonthly || 0;
    } else {
      return membershipTier.priceYearly || 0;
    }
  };

  const amount = getAmount();

  // Get payment intent
  const { data: paymentIntent } = useQuery<{
    paymentSecret: string;
    paymentId: string;
  }>({
    queryKey: ["membership-payment", profile?.id, user?.id, membershipTier.id, amount, paymentCycle],
    queryFn: async () => {
      const res = await httpClient!.post("/public/membership/payments/start", {
        membershipTierId: membershipTier.id,
        profileId: profile?.id,
        accountId: user?.id,
        amount,
        paymentCycle,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
      });
      return res.data;
    },
    enabled: !!profile?.id && !!user?.id && amount > 0,
  });

  const appearance: Appearance = {
    theme: "flat",
    variables: {
      fontLineHeight: "1.5",
      borderRadius: `${themeSettings.cornerRadius}px`,
      colorBackground: themeSettings.colors.background,
      accessibleColorOnColorPrimary: themeSettings.colors.text,
      colorPrimary: themeSettings.colors.primary,
      colorText: themeSettings.colors.text,
      logoColor: themeSettings.colors.text,
      colorTextPlaceholder: `${themeSettings.colors.text}${alphaToHexCode(0.5)}`,
    },
    rules: {
      ".AccordionItem": {
        backgroundColor: themeSettings.colors.background,
      },
      ".Block": {
        backgroundColor: themeSettings.colors.background,
        boxShadow: "none",
        padding: "12px",
      },
      ".Input": {
        padding: "12px",
        borderRadius: `${themeSettings.cornerRadius}px`,
        border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.4)}`,
      },
      ".Input:disabled, .Input--invalid:disabled": {
        color: "lightgray",
      },
      ".Tab": {
        padding: "10px 12px 8px 12px",
        border: "none",
        backgroundColor: themeSettings.colors.background,
      },
      ".Tab:hover": {
        border: "none",
        boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)",
      },
      ".Tab--selected, .Tab--selected:focus, .Tab--selected:hover": {
        border: "none",
        backgroundColor: themeSettings.colors.background,
        boxShadow:
          "0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)",
      },
      ".Label": {
        fontWeight: "500",
      },
    },
  };

  const handleFreeMembership = async () => {
    setIsLoading(true);
    try {
      await httpClient!.post("/public/membership/subscribe", {
        membershipTierId: membershipTier.id,
        profileId: profile?.id,
        accountId: user?.id,
        paymentCycle: "monthly",
        amount: 0,
      });
      toast.success("Successfully joined membership!");
      navigate("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to join membership");
    } finally {
      setIsLoading(false);
    }
  };

  if (amount === 0) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div
          className="mb-6 p-6 rounded-lg"
          style={{ border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.3)}` }}
        >
          <h3 className="text-xl font-bold mb-4">Free Membership</h3>
          <p className="mb-6">This membership is completely free. No payment required.</p>
          <EditorButtonWithoutEditor
            text={isLoading ? "Processing..." : "Join Free Membership"}
            onClick={handleFreeMembership}
            disabled={isLoading}
            fullWidth
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Payment Options */}
      <div
        className="mb-6 p-6 rounded-lg"
        style={{ border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.3)}` }}
      >
        <h3 className="text-lg font-bold mb-4">Payment Options</h3>

        {/* Payment Mode Selection */}
        {membershipTier.payWhatYouWant && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Payment Type</label>
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.3)}` }}
            >
              <button
                type="button"
                onClick={() => setPaymentMode("fixed")}
                className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                  paymentMode === "fixed" ? "text-white" : `${themeSettings.colors.text}${alphaToHexCode(0.7)}`
                }`}
                style={{
                  backgroundColor: paymentMode === "fixed" ? themeSettings.colors.primary : "transparent",
                }}
              >
                Fixed Price
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("payWhatYouWant")}
                className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                  paymentMode === "payWhatYouWant" ? "text-white" : `${themeSettings.colors.text}${alphaToHexCode(0.7)}`
                }`}
                style={{
                  backgroundColor: paymentMode === "payWhatYouWant" ? themeSettings.colors.primary : "transparent",
                }}
              >
                Pay What You Want
              </button>
            </div>
          </div>
        )}

        {/* Pay What You Want Amount Input */}
        {paymentMode === "payWhatYouWant" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Amount (Min: ${membershipTier.payWhatYouWantMinimum})
            </label>
            <EditorInputWithoutEditor
              placeholder={`$${membershipTier.payWhatYouWantMinimum}`}
              width="100%"
              type="number"
              value={customAmount.toString()}
              onChange={(value) => setCustomAmount(Number(value))}
            />
          </div>
        )}

        {/* Payment Cycle Selection */}
        {!membershipTier.payWhatYouWant && (membershipTier.priceMonthly || membershipTier.priceYearly) && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Billing Cycle</label>
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.3)}` }}
            >
              {membershipTier.priceMonthly && (
                <button
                  type="button"
                  onClick={() => setPaymentCycle("monthly")}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    paymentCycle === "monthly" ? "text-white" : `${themeSettings.colors.text}${alphaToHexCode(0.7)}`
                  }`}
                  style={{
                    backgroundColor: paymentCycle === "monthly" ? themeSettings.colors.primary : "transparent",
                  }}
                >
                  Monthly (${membershipTier.priceMonthly})
                </button>
              )}
              {membershipTier.priceYearly && (
                <button
                  type="button"
                  onClick={() => setPaymentCycle("yearly")}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    paymentCycle === "yearly" ? "text-white" : `${themeSettings.colors.text}${alphaToHexCode(0.7)}`
                  }`}
                  style={{
                    backgroundColor: paymentCycle === "yearly" ? themeSettings.colors.primary : "transparent",
                  }}
                >
                  Yearly (${membershipTier.priceYearly})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Total Amount Display */}
        <div
          className="text-center py-4 border-t"
          style={{ borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}` }}
        >
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold">${amount}</p>
          <p className="text-sm text-gray-500">{paymentCycle === "monthly" ? "per month" : "per year"}</p>
        </div>
      </div>

      {/* Stripe Payment Form */}
      {paymentIntent?.paymentSecret && paymentIntent?.paymentId && (
        <Elements
          options={{ clientSecret: paymentIntent.paymentSecret, appearance, loader: "auto" }}
          stripe={stripePromise.current}
        >
          <MembershipCheckoutForm
            amount={amount}
            paymentId={paymentIntent.paymentId}
            membershipTierId={membershipTier.id}
            paymentCycle={paymentCycle}
            user={user}
          />
        </Elements>
      )}
    </div>
  );
}

// Stripe Checkout Form Component
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

function MembershipCheckoutForm({
  amount,
  paymentId,
  membershipTierId,
  paymentCycle,
  user,
}: {
  amount: number;
  paymentId: string;
  membershipTierId: string;
  paymentCycle: PaymentCycle;
  user: PublicAuthUser;
}) {
  const { themeSettings, profile, navigate, httpClient } = useEditorContext();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderCreated, setIsOrderCreated] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!stripe || !elements || !profile) {
        return;
      }

      setIsLoading(true);

      // Create membership subscription
      if (!isOrderCreated) {
        try {
          await httpClient!.post("/public/membership/subscribe", {
            membershipTierId,
            profileId: profile.id,
            accountId: user?.id,
            paymentCycle,
            amount,
            paymentId,
            paymentProviderName: PaymentProviderName.Stripe,
          });
          setIsOrderCreated(true);
        } catch (error: any) {
          toast.error(error?.response?.data?.message || "Failed to create subscription");
          setIsLoading(false);
          return;
        }
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/membership/success?paymentId=${paymentId}&paymentProviderName=${PaymentProviderName.Stripe}`,
        },
      });

      if (error.type === "card_error" || error.type === "validation_error") {
        toast.error(error.message || "An unexpected error occurred.");
      } else {
        toast.error("An unexpected error occurred.");
      }

      setIsLoading(false);
    },
    [stripe, elements, profile, isOrderCreated, membershipTierId, paymentCycle, amount, user?.id, paymentId],
  );

  const paymentElementOptions = {
    layout: "accordion" as const,
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <EditorButtonWithoutEditor
        disabled={isLoading || !stripe || !elements}
        fullWidth
        text={isLoading ? "Processing..." : `Pay $${amount} Now`}
      />
    </form>
  );
}
