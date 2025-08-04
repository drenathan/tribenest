import { CancelSubscriptionInput, CreateSubscriptionInput } from "@src/routes/public/payments/schema";
import { BaseService } from "../baseService";
import { BadRequestError, ValidationError } from "@src/utils/app_error";
import { SubscriptionStatus } from "../paymentProvider/PaymentProvider";

type FinalizeSubscriptionInput = {
  profileId: string;
  subscriptionId: string;
};

export class ProfilePaymentService extends BaseService {
  public async createSubscription(
    input: CreateSubscriptionInput & { accountId: string; email: string; name?: string },
  ) {
    // TODO: check if the membership tier is valid and the amount makes sense
    const membershipTier = await this.database.models.MembershipTier.findById(input.membershipTierId);

    if (!membershipTier) {
      throw new BadRequestError("Invalid membership tier");
    }

    const paymentProvider = await this.apis.getPaymentProvider(input.profileId);

    let customer = await this.database.models.ProfilePaymentCustomer.findOne({
      profileId: input.profileId,
      accountId: input.accountId,
      paymentProviderName: paymentProvider.name,
    });

    if (!customer) {
      const res = await paymentProvider.createCustomer({
        email: input.email,
        name: input.name,
      });

      customer = await this.database.models.ProfilePaymentCustomer.insertOne({
        profileId: input.profileId,
        accountId: input.accountId,
        paymentProviderName: paymentProvider.name,
        customerId: res.customerId,
      });
    }

    let price = await this.database.models.ProfilePaymentPrice.findOne({
      profileId: input.profileId,
      billingCycle: input.billingCycle,
      amount: input.amount,
    });

    if (!price) {
      const res = await paymentProvider.createPrice({
        amount: input.amount,
        currency: "usd",
        billingCycle: input.billingCycle,
      });

      price = await this.database.models.ProfilePaymentPrice.insertOne({
        profileId: input.profileId,
        billingCycle: input.billingCycle,
        amount: input.amount,
        paymentProviderName: paymentProvider.name,
        priceId: res.priceId,
      });
    }

    const subscription = await paymentProvider.createSubscription({
      customerId: customer.customerId,
      priceId: price.priceId,
    });

    const membershipId = await this.database.client.transaction().execute(async (trx) => {
      const profilePaymentSubscription = await this.database.models.ProfilePaymentSubscription.insertOne(
        {
          profileId: input.profileId,
          accountId: input.accountId,
          paymentProviderName: paymentProvider.name,
          currentPeriodEnd: subscription.currentPeriodEnd,
          currentPeriodStart: subscription.currentPeriodStart,
          status: "pending",
          customerId: customer.customerId,
          paymentProfilePriceId: price.id,
          paymentProviderSubscriptionId: subscription.subscriptionId,
        },
        trx,
      );

      const membership = await this.database.models.Membership.insertOne(
        {
          profileId: input.profileId,
          accountId: input.accountId,
          membershipTierId: membershipTier.id,
          status: "pending",
          startDate: subscription.currentPeriodStart,
          endDate: subscription.currentPeriodEnd,
          profilePaymentSubscriptionId: profilePaymentSubscription.id,
        },
        trx,
      );

      return membership.id;
    });

    return {
      membershipId,
      ...subscription,
    };
  }

  public async changeSubscription(
    input: CreateSubscriptionInput & { accountId: string; email: string; name?: string },
  ) {
    // TODO: check if the membership tier is valid and the amount makes sense
    const membershipTier = await this.database.models.MembershipTier.findById(input.membershipTierId);

    if (!membershipTier) {
      throw new BadRequestError("Invalid membership tier");
    }

    const paymentProvider = await this.apis.getPaymentProvider(input.profileId);

    let customer = await this.database.models.ProfilePaymentCustomer.findOne({
      profileId: input.profileId,
      accountId: input.accountId,
      paymentProviderName: paymentProvider.name,
    });

    if (!customer) {
      throw new BadRequestError("Customer not found");
    }

    const [lastMembership] = await this.database.models.Membership.find(
      {
        profileId: input.profileId,
        accountId: input.accountId,
      },
      (qb) => {
        return qb
          .where("status", "in", ["active", "changed", "cancelled", "expired"])
          .where("profilePaymentSubscriptionId", "is not", null)
          .orderBy("endDate", "desc")
          .limit(1);
      },
    );

    if (!lastMembership || !lastMembership.profilePaymentSubscriptionId) {
      throw new BadRequestError("no membership found");
    }

    const profilePaymentSubscription = await this.database.models.ProfilePaymentSubscription.findOne({
      id: lastMembership.profilePaymentSubscriptionId,
    });

    if (!profilePaymentSubscription) {
      throw new BadRequestError("subscription not found");
    }

    const subscription = await paymentProvider.updateSubscription({
      subscriptionId: profilePaymentSubscription.paymentProviderSubscriptionId,
      amount: input.amount,
      currency: "usd",
      billingCycle: input.billingCycle,
      customerId: customer.customerId,
    });

    const membershipId = await this.database.client.transaction().execute(async (trx) => {
      const price = await this.database.models.ProfilePaymentPrice.insertOne(
        {
          profileId: input.profileId,
          billingCycle: input.billingCycle,
          amount: input.amount,
          paymentProviderName: paymentProvider.name,
          priceId: subscription.priceId,
        },
        trx,
      );

      await this.database.models.ProfilePaymentSubscription.updateOne(
        { id: profilePaymentSubscription.id },
        {
          currentPeriodEnd: subscription.currentPeriodEnd,
          currentPeriodStart: subscription.currentPeriodStart,
          paymentProfilePriceId: price.id,
        },
        trx,
      );

      const membership = await this.database.models.Membership.insertOne(
        {
          profileId: input.profileId,
          accountId: input.accountId,
          membershipTierId: membershipTier.id,
          status: "active",
          startDate: subscription.currentPeriodStart,
          endDate: subscription.currentPeriodEnd,
          profilePaymentSubscriptionId: profilePaymentSubscription.id,
        },
        trx,
      );

      if (lastMembership.status === "active") {
        await this.database.models.Membership.updateOne(
          { id: lastMembership.id },
          { status: "changed", endDate: new Date(), changedToMembershipId: membership.id },
          trx,
        );
      }

      return membership.id;
    });

    return {
      membershipId,
    };
  }

  public async finalizeSubscription(input: FinalizeSubscriptionInput) {
    const paymentProvider = await this.apis.getPaymentProvider(input.profileId);
    const subscription = await paymentProvider.getSubscription(input.subscriptionId);

    if (!subscription || subscription.status !== SubscriptionStatus.Active) {
      // TODO: we need some error handling here
      console.error("Subscription is not active");
      return;
    }

    const profilePaymentSubscription = await this.database.models.ProfilePaymentSubscription.findOne({
      paymentProviderSubscriptionId: subscription.subscriptionId,
    });

    if (!profilePaymentSubscription) {
      // TODO: we need some error handling here
      console.error("Profile payment subscription not found");
      return;
    }

    const membership = await this.database.models.Membership.findOne({
      profilePaymentSubscriptionId: profilePaymentSubscription.id,
    });

    if (!membership) {
      // TODO: we need some error handling here
      console.error("Membership not found");
      return;
    }

    if (membership.status === "active") {
      return;
    }

    const activeMembership = await this.database.models.Membership.findOne({
      profileId: input.profileId,
      status: "active",
      accountId: membership.accountId,
    });

    await this.database.client.transaction().execute(async (trx) => {
      await this.database.models.Membership.updateOne(
        { id: membership.id },
        { status: "active", endDate: subscription.currentPeriodEnd },
        trx,
      );

      await this.database.models.ProfilePaymentSubscription.updateOne(
        { id: profilePaymentSubscription.id },
        { status: "active" },
        trx,
      );

      if (activeMembership) {
        await this.database.models.Membership.updateOne(
          { id: activeMembership.id },
          { status: "changed", endDate: new Date(), changedToMembershipId: membership.id },
          trx,
        );
      }
    });
  }

  public async cancelSubscription(input: CancelSubscriptionInput) {
    const membership = await this.database.models.Membership.findOne({
      id: input.membershipId,
      profileId: input.profileId,
    });

    if (!membership) {
      throw new ValidationError("Membership not found");
    }

    if (membership.status !== "active") {
      throw new ValidationError("Membership is not active");
    }

    if (!membership.profilePaymentSubscriptionId) {
      throw new ValidationError("Profile payment subscription not found");
    }

    const profilePaymentSubscription = await this.database.models.ProfilePaymentSubscription.findOne({
      id: membership.profilePaymentSubscriptionId,
    });

    if (!profilePaymentSubscription?.paymentProviderSubscriptionId) {
      throw new ValidationError("Profile payment subscription not found");
    }

    const paymentProvider = await this.apis.getPaymentProvider(membership.profileId);

    await paymentProvider.cancelSubscription(profilePaymentSubscription.paymentProviderSubscriptionId);

    await this.database.models.Membership.updateOne({ id: membership.id }, { status: "cancelled" });

    await this.database.models.ProfilePaymentSubscription.updateOne(
      { id: profilePaymentSubscription.id },
      { status: "cancelled" },
    );
  }
}
