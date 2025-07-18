import { Kysely, PostgresDialect } from "kysely";
import { DB } from "../types";
import { Pool } from "pg";
import { getConfig } from "@src/configuration";
import { MyCamelCasePlugin } from "../Database";
import bcrypt from "bcryptjs";
import { PaymentProviderName } from "@src/services/paymentProvider/PaymentProvider";

export async function seedDatabase() {
  const db = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool(getConfig("postgres")),
    }),
    plugins: [
      new MyCamelCasePlugin({
        excludeColumns: ["content", "theme_settings", "permissions", "user_agent", "membership_tiers"],
      }),
    ],
  });

  const account = await db
    .insertInto("accounts")
    .values({
      email: "dev@tribenest.co",
      password: await bcrypt.hash("tribenest", 10),
      firstName: "Dev",
      lastName: "Tribe",
    })
    .returningAll()
    .executeTakeFirst();

  const profile = await db
    .insertInto("profiles")
    .values({
      name: "Tribe Dev",
      subdomain: "default-site",
    })
    .returningAll()
    .executeTakeFirst();

  await db
    .insertInto("profileAuthorizations")
    .values({
      profileId: profile!.id,
      accountId: account!.id,
      isOwner: true,
    })
    .executeTakeFirst();

  await db
    .insertInto("profileConfigurations")
    .values({ profileId: profile!.id, paymentProviderName: PaymentProviderName.Stripe })
    .executeTakeFirst();

  await db
    .insertInto("membershipTiers")
    .values({
      profileId: profile!.id,
      name: "Free Tier",
      description: "Free Membership",
      priceMonthly: 0,
      priceYearly: 0,
      isDefault: true,
    })
    .returningAll()
    .executeTakeFirst();
}
