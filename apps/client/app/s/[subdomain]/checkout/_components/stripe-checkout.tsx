import {
  alphaToHexCode,
  ApiError,
  EditorButtonWithoutEditor,
  IPublicOrder,
  PaymentProviderName,
  useCart,
  useEditorContext,
  usePublicAuth,
} from "@tribe-nest/frontend-shared";
import { useCallback, useRef, useState } from "react";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import httpClient from "@/services/httpClient";
import { Elements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

type Props = {
  amount: number;
  email: string;
  firstName?: string;
  lastName?: string;
};
export const StripeCheckout = ({ amount, email, firstName, lastName }: Props) => {
  const { themeSettings, profile } = useEditorContext();
  const { user } = usePublicAuth();
  const { cartItems } = useCart();

  const stripePromise = useRef(loadStripe(profile!.paymentProviderPublicKey));
  const { data: paymentIntent } = useQuery<{
    paymentSecret: string;
    paymentId: string;
  }>({
    queryKey: ["order", profile?.id, email, firstName, lastName, user?.id, cartItems],
    queryFn: async () => {
      const res = await httpClient.post("/public/payments/start", {
        amount,
        profileId: profile?.id,
        email,
        firstName,
        lastName,
        accountId: user?.id,
        cartItems,
      });
      return res.data;
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

  if (!profile) return null;

  return (
    <div>
      {paymentIntent?.paymentSecret && paymentIntent?.paymentId && (
        <Elements
          options={{ clientSecret: paymentIntent.paymentSecret, appearance, loader }}
          stripe={stripePromise.current}
        >
          <CheckoutForm
            amount={amount}
            firstName={firstName}
            lastName={lastName}
            email={email}
            paymentId={paymentIntent.paymentId}
          />
        </Elements>
      )}
    </div>
  );
};

import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CheckoutForm({
  amount,
  firstName,
  lastName,
  email,
  paymentId,
}: {
  amount: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  paymentId: string;
}) {
  const { user } = usePublicAuth();
  const { profile } = useEditorContext();
  const { cartItems } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<IPublicOrder | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!stripe || !elements || !profile) {
        // Stripe.js hasn't yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
      }

      setIsLoading(true);
      let localOrder = order;
      // This function is called even if the form is invalid, we only want to create the order once no matter how many times the user clicks the button
      if (!localOrder) {
        try {
          const res = await httpClient.post("/public/orders", {
            amount,
            profileId: profile.id,
            email,
            firstName,
            lastName,
            accountId: user?.id,
            cartItems,
            paymentId,
            paymentProviderName: PaymentProviderName.Stripe,
          });
          setOrder(res.data);
          localOrder = res.data;
        } catch (error) {
          toast.error((error as ApiError).response?.data?.message);
          console.error(error);
          setIsLoading(false);
          return;
        }
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your payment completion page
          return_url: `${window.location.origin}/checkout/finalise?orderId=${localOrder?.id}`,
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
    },
    [stripe, elements, profile, order, amount, email, firstName, lastName, user?.id, cartItems, paymentId],
  );

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
