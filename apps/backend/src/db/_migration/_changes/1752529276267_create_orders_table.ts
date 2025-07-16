import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.orders)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("account_id", "uuid", (col) => col.references(`${tables.accounts}.id`))
    .addColumn("status", "text", (col) => col.notNull())
    .addColumn("total_amount", "decimal(10, 2)", (col) => col.notNull())
    .addColumn("payment_provider_name", "text", (col) => col.notNull())
    .addColumn("payment_id", "text")
    .addColumn("first_name", "text")
    .addColumn("last_name", "text")
    .addColumn("email", "text")
    .$call(addDefaultColumns)
    .addCheckConstraint(
      "orders_check_account_id_or_name_email",
      sql`(account_id IS NOT NULL) OR (first_name IS NOT NULL AND last_name IS NOT NULL AND email IS NOT NULL)`,
    )
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.orders);

  await db.schema
    .createTable(tables.order_items)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("order_id", "uuid", (col) => col.notNull().references(`${tables.orders}.id`))
    .addColumn("product_id", "uuid", (col) => col.notNull().references(`${tables.products}.id`))
    .addColumn("product_variant_id", "uuid", (col) => col.notNull().references(`${tables.product_variants}.id`))
    .addColumn("quantity", "integer", (col) => col.notNull())
    .addColumn("price", "decimal(10, 2)", (col) => col.notNull())
    .addColumn("is_gift", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("cover_image", "text")
    .addColumn("recipient_name", "text")
    .addColumn("recipient_email", "text")
    .addColumn("recipient_message", "text")
    .addColumn("pay_what_you_want", "boolean", (col) => col.notNull().defaultTo(false))
    .addCheckConstraint(
      "order_item_gift_with_name_email",
      sql`(is_gift = true AND recipient_name IS NOT NULL AND recipient_email IS NOT NULL) OR (is_gift = false AND recipient_name IS NULL AND recipient_email IS NULL)`,
    )
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.order_items);

  await db.schema
    .alterTable(tables.profile_configurations)
    .addColumn("smtp_username", "text")
    .addColumn("smtp_password", "text")
    .addColumn("smtp_host", "text")
    .addColumn("smtp_port", "text")
    .addColumn("smtp_from", "text")
    .addColumn("r2_bucket_name", "text")
    .addColumn("r2_access_key_id", "text")
    .addColumn("r2_secret_access_key", "text")
    .addColumn("r2_endpoint", "text")
    .addColumn("r2_region", "text")
    .addColumn("r2_bucket_url", "text")
    .execute();

  await db.schema.alterTable(tables.media).addColumn("filename", "text").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.order_items).execute();
  await db.schema.dropTable(tables.orders).execute();
  await db.schema
    .alterTable(tables.profile_configurations)
    .dropColumn("smtp_username")
    .dropColumn("smtp_password")
    .dropColumn("smtp_host")
    .dropColumn("smtp_port")
    .dropColumn("smtp_from")
    .dropColumn("r2_bucket_name")
    .dropColumn("r2_access_key_id")
    .dropColumn("r2_secret_access_key")
    .dropColumn("r2_endpoint")
    .dropColumn("r2_region")
    .dropColumn("r2_bucket_url")
    .execute();

  await db.schema.alterTable(tables.media).dropColumn("filename").execute();
}
