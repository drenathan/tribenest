import { CreateMembershipTierInput } from "@src/routes/membershipTiers/schema";
import { BaseService } from "../baseService";
import { CreateMembershipBenefitInput } from "@src/routes/membershipBenefits/schema";
import { BadRequestError } from "@src/utils/app_error";

export class MembershipService extends BaseService {
  public async getMembershipTiers(profileId: string) {
    const data = await this.models.MembershipTier.getManyWithBenefits(profileId);
    return data;
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
}
