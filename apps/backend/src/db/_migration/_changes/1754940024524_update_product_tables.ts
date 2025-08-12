import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

const variantOptions = [
  {
    title: "Size",
    values: [
      { value: "M", label: "Medium" },
      { value: "L", label: "Large" },
      { value: "XL", label: "Extra Large" },
    ],
  },
  {
    title: "Color",
    values: [
      { value: "#000000", label: "Black" },
      { value: "#FFFFFF", label: "White" },
    ],
  },
];

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
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.product_stores);

  await db.schema
    .alterTable(tables.products)
    .addColumn("product_store_id", "uuid", (b) => b.references(`${tables.product_stores}.id`))
    .addColumn("external_id", "text")
    .execute();

  await db.schema
    .alterTable(tables.product_variants)
    .addColumn("external_id", "text")
    .addColumn("availability_status", "text", (b) => b.notNull().defaultTo("active"))
    .execute();

  await db.schema
    .alterTable(tables.media)
    .addColumn("product_store_id", "uuid", (b) => b.references(`${tables.product_stores}.id`))
    .execute();

  await db.schema.alterTable(tables.product_variant_option_values).addColumn("label", "text").execute();

  for (const option of variantOptions) {
    const optionId = await db
      .insertInto(tables.product_variant_options)
      .values({ title: option.title })
      .returning("id")
      .executeTakeFirstOrThrow();
    for (const value of option.values) {
      await db
        .insertInto(tables.product_variant_option_values)
        .values({ value, product_variant_option_id: optionId.id, label: value.label })
        .execute();
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.products).dropColumn("is_external").execute();
}
