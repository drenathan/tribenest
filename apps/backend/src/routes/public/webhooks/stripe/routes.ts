import { PaymentProvider, PaymentProviderName } from "@src/services/paymentProvider/PaymentProvider";
import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();

  router.post("/:profileId", bodyParser.raw({ type: "application/json" }), async (req, res) => {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let paymentProvider: PaymentProvider<Stripe>;

    try {
      paymentProvider = (await services.apis.getPaymentProvider(req.params.profileId)) as PaymentProvider<Stripe>;
      if (paymentProvider.name !== PaymentProviderName.Stripe) {
        return res.sendStatus(400);
      }
      event = paymentProvider.decryptWebhook(req.body, req.header("Stripe-Signature"));
    } catch (err) {
      console.log(err);
      return res.sendStatus(400);
    }

    // Extract the object from the event.
    const dataObject = event.data.object;

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample

    switch (event.type) {
      case "invoice.payment_succeeded":
        if (dataObject["billing_reason"] == "subscription_create") {
          // The subscription automatically activates after successful payment
          // Set the payment method used to pay the first invoice
          // as the default payment method for that subscription
          const subscription_id = (dataObject as Stripe.Invoice)?.parent?.subscription_details?.subscription as string;

          if (!subscription_id) {
            return res.sendStatus(400);
          }

          try {
            await services.profile.payment.finalizeSubscription({
              profileId: req.params.profileId,
              subscriptionId: subscription_id,
            });
          } catch (err) {
            console.log(err);
          }
        }

        break;
      case "invoice.payment_failed":
        // If the payment fails or the customer does not have a valid payment method,
        //  an invoice.payment_failed event is sent, the subscription becomes past_due.
        // Use this webhook to notify your user that their payment has
        // failed and to retrieve new card details.
        break;
      case "invoice.finalized":
        // If you want to manually send out invoices to your customers
        // or store them locally to reference to avoid hitting Stripe rate limits.
        break;
      case "customer.subscription.deleted":
        if (event.request != null) {
          // handle a subscription cancelled by your request
          // from above.
        } else {
          // handle subscription cancelled automatically based
          // upon your subscription settings.
        }
        break;
      case "customer.subscription.trial_will_end":
        // Send notification to your user that the trial will end
        break;
      default:
        // Unexpected event type
        break;
    }
    res.sendStatus(200);
  });

  return router;
};

export default {
  path: "/public/webhooks/stripe",
  init,
  disableBodyParser: true,
};
