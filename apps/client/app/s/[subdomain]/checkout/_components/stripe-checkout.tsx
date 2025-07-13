import { alphaToHexCode, EditorButtonWithoutEditor, useEditorContext } from "@tribe-nest/frontend-shared";
import { useEffect, useRef, useState } from "react";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import httpClient from "@/services/httpClient";
import { Elements } from "@stripe/react-stripe-js";

type Props = {
  amount: number;
  email: string;
};
export const StripeCheckout = ({ amount, email }: Props) => {
  const { themeSettings, profile } = useEditorContext();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const stripePromise = useRef(loadStripe(profile!.paymentProviderPublicKey));

  useEffect(() => {
    if (!profile) return;
    httpClient
      .post("/public/payments/start", { amount, profileId: profile.id, email })
      .then((res) => {
        setClientSecret(res.data.paymentSecret);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [amount, profile, email]);

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

  if (!profile) return null;

  return (
    <div>
      {clientSecret && (
        <Elements options={{ clientSecret, appearance, loader }} stripe={stripePromise.current}>
          <CheckoutForm amount={amount} />
        </Elements>
      )}
    </div>
  );
};

import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CheckoutForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: "http://drenathan1.localhost:3001/checkout/success/stripe",
      },
    });

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
  };

  const paymentElementOptions = {
    layout: "accordion" as const,
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <EditorButtonWithoutEditor
        disabled={isLoading || !stripe || !elements}
        fullWidth
        text={isLoading ? "loading" : `Pay $${amount} Now`}
      />
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}
