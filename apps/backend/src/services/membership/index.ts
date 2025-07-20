import { CreateMembershipTierInput } from "@src/routes/membershipTiers/schema";
import { BaseService } from "../baseService";
import { CreateMembershipBenefitInput } from "@src/routes/membershipBenefits/schema";
import { BadRequestError } from "@src/utils/app_error";
import { GetMembershipsInput } from "@src/routes/memberships/schema";
export type CreateMembershipInput = {
  profileId: string;
  membershipTierId?: string;
  accountId: string;
  endDate?: Date;
};
export class MembershipService extends BaseService {
  public async getMembershipTiers(profileId: string) {
    const data = await this.models.MembershipTier.getManyWithBenefits(profileId);
    return data;
  }

  public async getProfileMemberships(input: GetMembershipsInput) {
    return this.models.Membership.getProfileMemberships(input);
  }

  public async createMembership(input: CreateMembershipInput) {
    const { profileId, membershipTierId, accountId, endDate } = input;
    const membershipTier = membershipTierId
      ? await this.models.MembershipTier.findOne({ id: membershipTierId })
      : await this.models.MembershipTier.findOne({ profileId, priceMonthly: 0, priceYearly: 0, payWhatYouWant: false });

    if (!membershipTier) {
      throw new BadRequestError("Membership tier not found");
    }

    const existingMembership = await this.models.Membership.findOne({ profileId, accountId, status: "active" });

    const newMembership = await this.models.Membership.insertOne({
      profileId,
      accountId,
      membershipTierId: membershipTier.id,
      status: "active",
      startDate: new Date(),
      endDate,
    });

    if (existingMembership) {
      await this.models.Membership.updateOne(
        { id: existingMembership.id },
        { status: "changed", changedToMembershipId: newMembership.id },
      );
    }

    return newMembership;
  }

  public async createMembershipTier(input: CreateMembershipTierInput) {
    return this.models.MembershipTier.insertOne(input);
  }

  public async getMembershipBenefits(profileId: string) {
    const data = await this.models.MembershipBenefit.find({ profileId });
    return data;
  }

  public async createMembershipBenefit(input: CreateMembershipBenefitInput) {
    const existingBenefit = await this.models.MembershipBenefit.findOne({
      title: input.title,
      profileId: input.profileId,
    });

    if (existingBenefit) {
      throw new BadRequestError("Benefit already exists");
    }

    return this.models.MembershipBenefit.insertOne(input);
  }

  public async updateMembershipTierBenefits({ id, benefits }: { id: string; benefits: string[] }) {
    const existingBenefits = await this.database.models.MembershipTierBenefit.find({ membershipTierId: id });

    const benefitsToDelete = existingBenefits.filter((benefit) => !benefits.includes(benefit.membershipBenefitId));

    if (benefitsToDelete.length) {
      await this.database.models.MembershipTierBenefit.deleteMany({ id: benefitsToDelete.map((b) => b.id) });
    }

    await Promise.all(
      benefits.map((benefitId, index) => {
        const shouldCreate = !existingBenefits.some((b) => b.membershipBenefitId === benefitId);

        if (shouldCreate) {
          return this.database.models.MembershipTierBenefit.insertOne({
            membershipTierId: id,
            membershipBenefitId: benefitId,
            order: index,
          });
        }

        return this.database.models.MembershipTierBenefit.updateOne(
          { membershipTierId: id, membershipBenefitId: benefitId },
          { order: index },
        );
      }),
    );

    return true;
  }

  public async getAccountMembership(accountId: string, profileId: string) {
    const membership = await this.models.Membership.getActiveMembership({ accountId, profileId });
    return membership;
  }
}
