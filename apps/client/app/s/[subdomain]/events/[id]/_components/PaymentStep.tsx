import {
  alphaToHexCode,
  EditorButtonWithoutEditor,
  IEvent,
  LoadingState,
  useEditorContext,
} from "@tribe-nest/frontend-shared";
import React, { useCallback, useRef, useState } from "react";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { useQuery } from "@tanstack/react-query";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

type BuyerData = {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
};
type Props = {
  onNext: () => void;
  onBack: () => void;
  totalAmount: number;
  buyerData: BuyerData;
  selectedTickets: Record<string, number>;
  event: IEvent;
};

type CreateOrderResponse = {
  paymentSecret: string;
  paymentId: string;
  orderId: string;
  shippingCost: number;
  totalAmount: number;
  subTotal: number;
};

export function PaymentStep({ onBack, buyerData, selectedTickets, event }: Props) {
  const { themeSettings, profile, httpClient } = useEditorContext();
  const stripePromise = useRef(loadStripe(profile!.paymentProviderPublicKey));
  const { email, firstName, lastName } = buyerData;

  const { data: order, isLoading: isCreatingOrder } = useQuery<CreateOrderResponse>({
    queryKey: [
      "create-order",
      {
        selectedTickets,
        profileId: profile?.id,
        email,
        firstName,
        lastName,
      },
    ],
    queryFn: async () => {
      const { data } = await httpClient!.post(`/public/events/${event.id}/checkout`, {
        items: selectedTickets,
        profileId: profile?.id,
        email,
        firstName,
        lastName,
      });
      return data;
    },
    enabled: !!profile?.id,
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
  // Enable the skeleton loader UI for optimal loading.
  const loader = "auto";

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeSettings.colors.text }}>
          Payment
        </h2>
        <p className="text-sm" style={{ color: themeSettings.colors.text + "80" }}>
          Complete your purchase to secure your tickets.
        </p>
      </div>

      {/* Payment Summary */}
      <div
        className="p-6 border-2"
        style={{
          borderColor: themeSettings.colors.primary + "40",
          backgroundColor: themeSettings.colors.background,
          borderRadius: `${themeSettings.cornerRadius}px`,
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: themeSettings.colors.text }}>
          Order Summary
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-lg" style={{ color: themeSettings.colors.text }}>
            Total Amount
          </span>
          <span className="text-2xl font-bold" style={{ color: themeSettings.colors.primary }}>
            ${order?.totalAmount?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Placeholder */}
      <div
        className="md:p-8 p-2 border-2 border-dashed"
        style={{
          borderColor: themeSettings.colors.primary + "60",
          backgroundColor: themeSettings.colors.background + "20",
          borderRadius: `${themeSettings.cornerRadius}px`,
        }}
      >
        <div>
          {isCreatingOrder && <LoadingState />}
          {order?.paymentSecret && order?.paymentId && (
            <Elements
              options={{ clientSecret: order.paymentSecret, appearance, loader }}
              stripe={stripePromise.current}
            >
              <CheckoutForm amount={order.totalAmount} orderId={order.orderId} onBack={onBack} eventId={event.id} />
            </Elements>
          )}
        </div>
      </div>
      <EditorButtonWithoutEditor disabled={isCreatingOrder} variant="secondary" text={"Back"} onClick={onBack} />
    </div>
  );
}

export default function CheckoutForm({
  amount,
  orderId,
  eventId,
}: {
  amount: number;
  orderId: string;
  onBack: () => void;
  eventId: string;
}) {
  const { profile } = useEditorContext();
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!stripe || !elements || !profile) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
    console.log("handleSubmit");

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/events/${eventId}/finalise?orderId=${orderId}`,
      },
    });

    console.log(error, "error");

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An unexpected error occurred.");
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  }, [orderId, stripe, elements, profile, eventId]);

  const paymentElementOptions = {
    layout: "accordion" as const,
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement id="payment-element" options={paymentElementOptions} />

      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
      <EditorButtonWithoutEditor
        disabled={isLoading || !stripe || !elements}
        fullWidth
        text={isLoading ? "loading" : `Pay $${amount} Now`}
      />
    </form>
  );
}
