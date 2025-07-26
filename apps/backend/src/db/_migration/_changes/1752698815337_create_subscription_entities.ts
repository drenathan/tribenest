import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.profile_payment_customers)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("account_id", "uuid", (col) => col.notNull().references(`${tables.accounts}.id`))
    .addColumn("customer_id", "text", (col) => col.notNull())
    .addColumn("payment_provider_name", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.profile_payment_customers);

  await db.schema
    .createTable(tables.profile_payment_prices)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("payment_provider_name", "text", (col) => col.notNull())
    .addColumn("price_id", "text", (col) => col.notNull())
    .addColumn("amount", "integer", (col) => col.notNull())
    .addColumn("billing_cycle", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.profile_payment_prices);

  await db.schema
    .createTable(tables.profile_payment_subscriptions)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("account_id", "uuid", (col) => col.notNull().references(`${tables.accounts}.id`))
    .addColumn("customer_id", "text", (col) => col.notNull())
    .addColumn("payment_provider_name", "text", (col) => col.notNull())
    .addColumn("payment_profile_price_id", "uuid", (col) =>
      col.notNull().references(`${tables.profile_payment_prices}.id`),
    )
    .addColumn("payment_provider_subscription_id", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull())
    .addColumn("current_period_start", "timestamp", (col) => col.notNull())
    .addColumn("current_period_end", "timestamp", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.profile_payment_subscriptions);

  await db.schema
    .alterTable(tables.memberships)
    .addColumn("profile_payment_subscription_id", "uuid", (col) =>
      col.references(`${tables.profile_payment_subscriptions}.id`),
    )
    .execute();

  await db.schema
    .alterTable(tables.profile_configurations)
    .addColumn("payment_provider_webhook_secret", "text")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.memberships).dropColumn("profile_payment_subscription_id").execute();
  await db.schema.dropTable(tables.profile_payment_subscriptions).execute();
  await db.schema.dropTable(tables.profile_payment_prices).execute();
  await db.schema.dropTable(tables.profile_payment_customers).execute();
  await db.schema.alterTable(tables.profile_configurations).dropColumn("payment_provider_webhook_secret").execute();
}
