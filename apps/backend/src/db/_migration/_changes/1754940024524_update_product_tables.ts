import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.product_stores)
    .addColumn("id", "uuid", (b) => b.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("external_id", "text", (b) => b.notNull())
    .addColumn("name", "text", (b) => b.notNull())
    .addColumn("profile_id", "uuid", (b) => b.notNull().references(`${tables.profiles}.id`))
    .addColumn("provider", "text", (b) => b.notNull())
    .addColumn("access_token", "text", (b) => b.notNull())
    .addColumn("last_synced_at", "timestamptz")
    .addColumn("defaults", "jsonb", (b) => b.notNull().defaultTo("{}"))
    .$call(addDefaultColumns)
    .addUniqueConstraint("product_stores_external_id_provider_profile_id_unique", [
      "external_id",
      "provider",
      "profile_id",
    ])
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.product_stores);

  await db.schema
    .alterTable(tables.products)
    .addColumn("product_store_id", "uuid", (b) => b.references(`${tables.product_stores}.id`))
    .addColumn("external_id", "text")
    .execute();

  await db.schema
    .alterTable(tables.products)
    .addUniqueConstraint("product_store_id_external_id_unique", ["product_store_id", "external_id"])
    .execute();

  await db.schema
    .alterTable(tables.product_variants)
    .addColumn("external_id", "text")
    .addColumn("availability_status", "text", (b) => b.notNull().defaultTo("active"))
    .addColumn("color", "text")
    .addColumn("size", "text")
    .execute();

  await db.schema
    .alterTable(tables.product_variants)
    .addUniqueConstraint("product_id_color_size_unique", ["product_id", "color", "size"])
    .execute();

  await db.schema
    .alterTable(tables.product_variants)
    .addUniqueConstraint("product_id_external_id_unique", ["product_id", "external_id"])
    .execute();

  await db.schema
    .alterTable(tables.media)
    .addColumn("product_store_id", "uuid", (b) => b.references(`${tables.product_stores}.id`))
    .execute();

  await db.schema
    .alterTable(tables.order_items)
    .addColumn("delivery_type", "text", (col) => col.notNull())
    .addColumn("color", "text")
    .addColumn("size", "text")
    .addColumn("external_id", "text")
    .execute();

  await db.schema
    .createTable(tables.order_delivery_groups)
    .addColumn("id", "uuid", (b) => b.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("order_id", "uuid", (b) => b.references(`${tables.orders}.id`))
    .addColumn("external_id", "text")
    .addColumn("shipping_cost", "decimal(10, 2)")
    .addColumn("external_id", "text")
    .addColumn("product_store_id", "uuid", (b) => b.references(`${tables.product_stores}.id`))
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.order_delivery_groups);

  await db.schema
    .createTable(tables.order_delivery_group_items)
    .addColumn("id", "uuid", (b) => b.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("order_item_id", "uuid", (b) => b.references(`${tables.order_items}.id`))
    .addColumn("order_delivery_group_id", "uuid", (b) => b.references(`${tables.order_delivery_groups}.id`))
    .addUniqueConstraint("order_item_id_order_delivery_group_id_unique", ["order_item_id", "order_delivery_group_id"])
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.order_delivery_group_items);

  await db.schema.dropTable(tables.product_variant_configurations).execute();
  await db.schema.dropTable(tables.product_variant_option_values).execute();
  await db.schema.dropTable(tables.product_variant_options).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.products).dropColumn("product_store_id").dropColumn("external_id").execute();
  await db.schema
    .alterTable(tables.product_variants)
    .dropColumn("external_id")
    .dropColumn("availability_status")
    .dropColumn("color")
    .dropColumn("size")
    .execute();
  await db.schema.alterTable(tables.media).dropColumn("product_store_id").execute();
  await db.schema.alterTable(tables.product_variant_option_values).dropColumn("label").execute();
  await db.schema.dropTable(tables.product_stores).execute();
  // await db.schema.dropTable(tables.order_delivery_group_items).execute();
  // await db.schema.dropTable(tables.order_delivery_groups).execute();
}
