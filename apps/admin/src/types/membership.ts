export type MembershipTier = {
  id: string;
  name: string;
  description: string;
  priceMonthly?: number;
  priceYearly?: number;
  payWhatYouWant: boolean;
  payWhatYouWantMinimum?: number;
  payWhatYouWantMaximum?: number;
  benefits: MembershipBenefit[];
};

export type MembershipBenefit = {
  id: string;
  title: string;
  description: string;
  profileId: string;
};
