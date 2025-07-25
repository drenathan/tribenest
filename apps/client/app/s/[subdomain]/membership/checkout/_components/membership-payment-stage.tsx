import {
  addAlphaToHexCode,
  alphaToHexCode,
  EditorButtonWithoutEditor,
  FormError,
  LoadingState,
  MembershipTier,
  useEditorContext,
  usePublicAuth,
} from "@tribe-nest/frontend-shared";
import { usePublicAuthGuard } from "../../../_hooks/usePublicAuthGuard";
import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";

type Props = {
  selectedTier: MembershipTier;
  customAmount: number;
  paymentCycle: "month" | "year";
  onBackToDetails: () => void;
};
export function MembershipPaymentStage({ selectedTier, customAmount, paymentCycle, onBackToDetails }: Props) {
  usePublicAuthGuard();
  const { themeSettings, httpClient, profile } = useEditorContext();
  const { user } = usePublicAuth();
  const stripePromise = useRef(loadStripe(profile!.paymentProviderPublicKey));
  const [subscription, setSubscription] = useState<{ subscriptionId: string; clientSecret: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const amount = selectedTier.payWhatYouWant
    ? customAmount
    : paymentCycle === "month"
      ? selectedTier.priceMonthly
      : selectedTier.priceYearly;

  useEffect(() => {
    if (!user || !httpClient) return;
    setIsLoading(true);
    httpClient
      .post("/public/payments/subscriptions", {
        amount,
        billingCycle: paymentCycle,
        profileId: profile!.id,
        membershipTierId: selectedTier.id,
      })
      .then((res) => setSubscription(res.data))
      .finally(() => setIsLoading(false));
  }, [user, httpClient, amount, paymentCycle, profile, selectedTier]);

  return (
    <Elements stripe={stripePromise.current}>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Payment</h1>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <div
            className="p-8 rounded-lg"
            style={{ border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.3)}` }}
          >
            <p className="text-lg mb-4">
              {selectedTier.name} - ${amount}
              {selectedTier.payWhatYouWant ? " per month" : paymentCycle === "month" ? " per month" : " per year"}.
            </p>

            {isLoading || !subscription?.clientSecret ? (
              <LoadingState />
            ) : (
              <Content clientSecret={subscription?.clientSecret} onBackToDetails={onBackToDetails} />
            )}
          </div>
        </div>
      </div>
    </Elements>
  );
}

const Content = ({ clientSecret, onBackToDetails }: { clientSecret: string; onBackToDetails: () => void }) => {
  // Initialize an instance of stripe.
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const { user, refetchUser } = usePublicAuth();
  const { themeSettings } = useEditorContext();
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useEditorContext();

  if (!stripe || !elements) {
    // Stripe.js has not loaded yet. Make sure to disable
    // form submission until Stripe.js has loaded.
    return "";
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsLoading(true);

    // Use card Element to tokenize payment details
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${user?.firstName} ${user?.lastName}`,
        },
      },
    });

    if (error) {
      // show error and collect new card details.
      setMessage(error.message ?? "Unknown error");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);

    refetchUser();
    navigate("/account", { replace: true });
  };

  const style = {
    base: {
      color: themeSettings.colors.primary,
      fontSize: "16px",
      "::placeholder": {
        color: addAlphaToHexCode(themeSettings.colors.primary, 0.5),
      },
      border: `1px solid ${addAlphaToHexCode(themeSettings.colors.primary, 0.3)}`,
    },
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormError message={message} />
      <CardElement options={{ style }} />
      <div className="flex gap-4 justify-between mt-8">
        <EditorButtonWithoutEditor
          text="Back"
          onClick={onBackToDetails}
          type="button"
          variant="secondary"
          disabled={isLoading}
        />
        <EditorButtonWithoutEditor text="Pay" type="submit" disabled={isLoading} />
      </div>
    </form>
  );
};
