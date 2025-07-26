import { Expression, Kysely, Selectable, sql, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { GetMembershipsInput } from "@src/routes/memberships/schema";
import { PaginatedData } from "@src/types";
export type IMembership = DB["memberships"];

type MembershipFilter = {
  membershipTierId?: string;
  query?: string;
  active?: string;
};

export type GetProfileMembershipsResponse = {
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
};

export type GetActiveMembershipResponse = Selectable<DB["memberships"]> & {
  membershipTier: Selectable<DB["membershipTiers"]> & {
    benefits: Selectable<DB["membershipBenefits"]>[];
  };
  amount: number;
  billingCycle: string;
};

export class MembershipModel extends BaseModel<"memberships", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "memberships", "id");
  }

  public async getProfileMemberships(
    input: GetMembershipsInput,
  ): Promise<PaginatedData<GetProfileMembershipsResponse>> {
    const { membershipTierId, query, active } = (input.filter ?? {}) as MembershipFilter;
    const isActive = active === "true";
    const nonActive = active === "false";

    const filterQuery = this.client
      .with("orderedMemberships", (eb) => {
        return eb
          .selectFrom("memberships as m")
          .fullJoin("membershipTiers as mt", "mt.id", "m.membershipTierId")
          .fullJoin("accounts as a", "a.id", "m.accountId")
          .where((eb) => {
            const conditions: Expression<SqlBool>[] = [];
            conditions.push(eb("m.profileId", "=", input.profileId));
            conditions.push(eb("m.status", "!=", "pending"));
            conditions.push(eb("m.status", "!=", "changed"));

            if (query?.length) {
              conditions.push(
                eb.or([
                  eb("a.firstName", "ilike", `%${query}%`),
                  eb("a.lastName", "ilike", `%${query}%`),
                  eb("a.email", "ilike", `%${query}%`),
                ]),
              );
            }

            if (membershipTierId?.length) {
              conditions.push(eb("m.membershipTierId", "=", membershipTierId));
            }

            if (isActive) {
              conditions.push(eb("m.status", "=", "active"));
            }

            if (nonActive) {
              conditions.push(eb("m.status", "!=", "active"));
            }

            return eb.and(conditions);
          })
          .select((eb) => [
            eb.ref("m.id").as("id"),
            eb.ref("m.accountId").as("accountId"),
            eb.ref("m.profileId").as("profileId"),
            eb.ref("m.membershipTierId").as("membershipTierId"),
            eb.ref("m.status").as("status"),
            eb.ref("m.startDate").as("startDate"),
            eb.ref("m.endDate").as("endDate"),
            eb.ref("mt.name").as("membershipTierName"),
            eb.ref("m.profilePaymentSubscriptionId").as("profilePaymentSubscriptionId"),
            sql`ROW_NUMBER() OVER (PARTITION BY m.account_id ORDER BY m.start_date DESC)`.as("rowNumber"),
            sql`a.first_name || ' ' || a.last_name`.as("fullName"),
            eb.ref("a.email").as("email"),
          ]);
      })
      .selectFrom("orderedMemberships as om")
      .where("om.rowNumber", "=", 1);

    const total = await filterQuery.select((eb) => eb.fn.countAll().as("total")).executeTakeFirst();
    if (!total?.total) {
      return {
        data: [],
        total: 0,
        page: input.page,
        hasNextPage: false,
        nextPage: null,
        pageSize: input.limit,
      };
    }

    const data = await filterQuery
      .leftJoin("profilePaymentSubscriptions as pps", "pps.id", "om.profilePaymentSubscriptionId")
      .leftJoin("profilePaymentPrices as ppp", "ppp.id", "pps.paymentProfilePriceId")
      .selectAll("om")
      .select((eb) => [eb.ref("ppp.amount").as("subscriptionAmount"), eb.ref("ppp.billingCycle").as("billingCycle")])
      .select((eb) => [
        this.jsonObjectFrom(
          eb
            .selectFrom("memberships as accountMemberships")
            .where("accountMemberships.status", "!=", "pending")
            .whereRef("accountMemberships.accountId", "=", "om.accountId")
            .orderBy("accountMemberships.startDate", "asc")
            .limit(1)
            .select(["accountMemberships.startDate", "accountMemberships.accountId"]),
        ).as("firstMembership"),
      ])
      .orderBy("om.startDate", "desc")
      .limit(input.limit)
      .offset((input.page - 1) * input.limit)
      .execute();

    const hasNextPage = data.length === input.limit;

    return {
      data: data as GetProfileMembershipsResponse[],
      total: Number(total.total),
      page: input.page,
      hasNextPage,
      nextPage: hasNextPage ? input.page + 1 : null,
      pageSize: input.limit,
    };
  }

  public async getActiveMembership({ accountId, profileId }: { accountId: string; profileId: string }) {
    const membership = await this.client
      .selectFrom("memberships")
      .leftJoin("profilePaymentSubscriptions as pps", "pps.id", "memberships.profilePaymentSubscriptionId")
      .leftJoin("profilePaymentPrices as ppp", "ppp.id", "pps.paymentProfilePriceId")
      .where((eb) => {
        const conditions: Expression<SqlBool>[] = [];
        conditions.push(eb("memberships.accountId", "=", accountId));
        conditions.push(eb("memberships.profileId", "=", profileId));
        conditions.push(
          eb.or([
            eb("memberships.status", "=", "active"),
            eb.and([eb("memberships.status", "=", "cancelled"), eb("memberships.endDate", ">", new Date())]),
          ]),
        );
        return eb.and(conditions);
      })
      .selectAll("memberships")
      .select((eb) => [eb.ref("ppp.amount").as("subscriptionAmount"), eb.ref("ppp.billingCycle").as("billingCycle")])
      .select((eb) => [
        this.jsonObjectFrom(
          eb
            .selectFrom("membershipTiers")
            .select((eb) => [
              this.jsonArrayFrom(
                eb
                  .selectFrom("membershipTiersBenefits as mtb")
                  .selectAll()
                  .whereRef("mtb.membershipTierId", "=", "membershipTiers.id")
                  .fullJoin("membershipBenefits as mb", "mb.id", "mtb.membershipBenefitId")
                  .orderBy("mtb.order", "asc"),
              ).as("benefits"),
            ])
            .selectAll()
            .whereRef("membershipTiers.id", "=", "memberships.membershipTierId"),
        ).as("membershipTier"),
      ])
      .executeTakeFirst();

    return membership as unknown as GetActiveMembershipResponse;
  }
}
