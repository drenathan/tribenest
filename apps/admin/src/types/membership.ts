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
  order: number;
  archivedAt?: string;
};

export type MembershipBenefit = {
  id: string;
  title: string;
  description: string;
  profileId: string;
};

export type IMembership = {
  id: string;
  profileId: string;
  membershipTierId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  membershipTierName: string;
  subscriptionAmount: number;
  fullName: string;
  email: string;
  country?: string;
  firstMembership: {
    startDate: string;
  };
};
