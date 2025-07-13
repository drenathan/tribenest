import { Kysely, sql } from "kysely";
import { tables } from "@src/db/constants/tables";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

const variantOptions = [
  { title: "Format", values: ["wav", "aif", "flac", "cd", "vinyl"] },
  { title: "Sample Rate", values: ["44.1kHz", "48kHz"] },
];

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.product_categories)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("title", "text", (col) => col.notNull().unique())
    .addColumn("description", "text")
    .$call(addDefaultColumns)
    .execute();
  addUpdateUpdatedAtTrigger(db, tables.product_categories);

  await db
    .insertInto(tables.product_categories)
    .values([
      { title: "Music", description: "Music" },
      { title: "Merch", description: "Merch" },
    ])
    .execute();

  await db.schema
    .createTable(tables.products)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.references(`${tables.profiles}.id`).notNull())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("category_id", "uuid", (col) => col.references(`${tables.product_categories}.id`).notNull())
    .addColumn("is_single", "boolean", (col) => col.defaultTo(false))
    .addColumn("published_at", "timestamptz")
    .$call(addDefaultColumns)
    .execute();
  addUpdateUpdatedAtTrigger(db, tables.products);

  await db.schema
    .createTable(tables.product_variants)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("price", "decimal(10, 2)", (col) => col.notNull())
    .addColumn("product_id", "uuid", (col) => col.references(`${tables.products}.id`).notNull())
    .addColumn("is_default", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("delivery_type", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  addUpdateUpdatedAtTrigger(db, tables.product_variants);

  await db.schema
    .createTable(tables.product_variant_tracks)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("is_featured", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("has_explicit_content", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("product_variant_id", "uuid", (col) => col.references(`${tables.product_variants}.id`).notNull())
    .$call(addDefaultColumns)
    .execute();
  addUpdateUpdatedAtTrigger(db, tables.product_variant_tracks);

  await db.schema
    .createTable(tables.product_variant_options)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("title", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();

  await db.schema
    .createTable(tables.product_variant_option_values)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("value", "text", (col) => col.notNull())
    .addColumn("product_variant_option_id", "uuid", (col) =>
      col.references(`${tables.product_variant_options}.id`).notNull(),
    )
    .$call(addDefaultColumns)
    .execute();
  addUpdateUpdatedAtTrigger(db, tables.product_variant_option_values);

  for (const option of variantOptions) {
    const optionId = await db
      .insertInto(tables.product_variant_options)
      .values({ title: option.title })
      .returning("id")
      .executeTakeFirstOrThrow();
    for (const value of option.values) {
      await db
        .insertInto(tables.product_variant_option_values)
        .values({ value, product_variant_option_id: optionId.id })
        .execute();
    }
  }

  await db.schema
    .createTable(tables.product_variant_configurations)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("product_variant_id", "uuid", (col) =>
      col.references(`${tables.product_variants}.id`).notNull().onDelete("cascade"),
    )
    .addColumn("product_variant_option_id", "uuid", (col) =>
      col.references(`${tables.product_variant_options}.id`).notNull(),
    )
    .addColumn("product_variant_option_value_id", "uuid", (col) =>
      col.references(`${tables.product_variant_option_values}.id`).notNull(),
    )
    .$call(addDefaultColumns)
    .execute();
  addUpdateUpdatedAtTrigger(db, tables.product_variant_configurations);

  await db.schema
    .alterTable(tables.product_variant_configurations)
    .addUniqueConstraint(
      "product_variant_configurations_product_variant_id_product_variant_option_id_product_variant_option_value_id_unique",
      ["product_variant_id", "product_variant_option_id", "product_variant_option_value_id"],
    )
    .execute();

  await db.schema
    .createTable(tables.media_mappings)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("media_id", "uuid", (col) => col.references(`${tables.media}.id`).notNull())
    .addColumn("entity_id", "uuid", (col) => col.notNull())
    .addColumn("entity_type", "text", (col) => col.notNull())
    .addColumn("order", "integer", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  addUpdateUpdatedAtTrigger(db, tables.media_mappings);
  await db.schema
    .alterTable(tables.media_mappings)
    .addUniqueConstraint("media_mappings_entity_id_order_unique", ["entity_id", "order"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.media_mappings).execute();
  await db.schema.dropTable(tables.product_variant_configurations).execute();
  await db.schema.dropTable(tables.product_variant_option_values).execute();
  await db.schema.dropTable(tables.product_variant_options).execute();
  await db.schema.dropTable(tables.product_variant_tracks).execute();
  await db.schema.dropTable(tables.product_variants).execute();
  await db.schema.dropTable(tables.products).execute();
  await db.schema.dropTable(tables.product_categories).execute();
}
