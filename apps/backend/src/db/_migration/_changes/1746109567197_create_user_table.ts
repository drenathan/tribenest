import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_trigger()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await db.schema
    .createTable(tables.accounts)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("password", "varchar(255)", (col) => col.notNull())
    .addColumn("first_name", "varchar(255)", (col) => col.notNull())
    .addColumn("last_name", "varchar(255)", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.accounts);

  await db.schema
    .createTable(tables.sessions)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("account_id", "uuid", (col) => col.notNull().references(`${tables.accounts}.id`).onDelete("cascade"))
    .addColumn("is_valid", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("user_agent", "jsonb")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.sessions);

  await db.schema
    .createTable(tables.profiles)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("subdomain", "text", (col) => col.notNull().unique())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.profiles);

  await db.schema
    .createTable(tables.profile_authorizations)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`).onDelete("cascade"))
    .addColumn("account_id", "uuid", (col) => col.notNull().references(`${tables.accounts}.id`).onDelete("cascade"))
    .addColumn("is_owner", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("permissions", "jsonb", (col) => col.notNull().defaultTo(sql`'[]'::jsonb`))
    .addColumn("archived_at", "timestamptz")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.profile_authorizations);

  await db.schema
    .createTable(tables.membership_tiers)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`).onDelete("cascade"))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("price_monthly", "integer")
    .addColumn("price_yearly", "integer")
    .addColumn("pay_what_you_want", "boolean", (col) => col.defaultTo(false))
    .addColumn("pay_what_you_want_minimum", "integer")
    .addColumn("pay_what_you_want_maximum", "integer")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.membership_tiers);

  await db.schema
    .createTable(tables.membership_benefits)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`).onDelete("cascade"))
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.membership_benefits);

  await db.schema
    .createTable(tables.membership_tiers_benefits)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("membership_benefit_id", "uuid", (col) =>
      col.notNull().references(`${tables.membership_benefits}.id`).onDelete("cascade"),
    )
    .addColumn("order", "integer", (col) => col.notNull())
    .addColumn("membership_tier_id", "uuid", (col) =>
      col.notNull().references(`${tables.membership_tiers}.id`).onDelete("cascade"),
    )
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.membership_tiers_benefits);

  await db.schema
    .createTable(tables.memberships)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`).onDelete("cascade"))
    .addColumn("membership_tier_id", "uuid", (col) =>
      col.notNull().references(`${tables.membership_tiers}.id`).onDelete("cascade"),
    )
    .addColumn("payment_circle", "text", (col) => col.notNull())
    .addColumn("account_id", "uuid", (col) => col.notNull().references(`${tables.accounts}.id`).onDelete("cascade"))
    .addColumn("start_date", "timestamptz", (col) => col.notNull())
    .addColumn("end_date", "timestamptz")
    .addColumn("status", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.memberships);

  await db.schema
    .createTable(tables.posts)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`).onDelete("cascade"))
    .addColumn("caption", "text", (col) => col.notNull())
    .addColumn("mediaLink", "text", (col) => col.notNull())
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("archived_at", "timestamptz")
    .addColumn("membership_tiers", "jsonb", (col) => col.notNull().defaultTo(sql`'[]'::jsonb`))
    .addColumn("created_by", "uuid", (col) => col.notNull().references(`${tables.accounts}.id`).onDelete("cascade"))
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.posts);

  await db.schema
    .createTable(tables.post_collections)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`).onDelete("cascade"))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("archived_at", "timestamptz")
    .addColumn("post_type", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.post_collections);

  await db.schema
    .createTable(tables.post_collection_posts)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("post_id", "uuid", (col) => col.notNull().references(`${tables.posts}.id`).onDelete("cascade"))
    .addColumn("post_collection_id", "uuid", (col) =>
      col.notNull().references(`${tables.post_collections}.id`).onDelete("cascade"),
    )
    .addColumn("order", "integer", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.post_collection_posts);

  await db.schema
    .createTable(tables.comments)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("entity_id", "uuid", (col) => col.notNull())
    .addColumn("entity_type", "text", (col) => col.notNull())
    .addColumn("account_id", "uuid", (col) => col.notNull().references(`${tables.accounts}.id`).onDelete("cascade"))
    .addColumn("content", "text", (col) => col.notNull())
    .addColumn("archived_at", "timestamptz")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.comments);

  await db.schema
    .createTable(tables.likes)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("entity_id", "uuid", (col) => col.notNull())
    .addColumn("entity_type", "text", (col) => col.notNull())
    .addColumn("account_id", "uuid", (col) => col.notNull().references(`${tables.accounts}.id`).onDelete("cascade"))
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.likes);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.sessions).execute();
  await db.schema.dropTable(tables.profile_authorizations).execute();
  await db.schema.dropTable(tables.memberships).execute();
  await db.schema.dropTable(tables.comments).execute();
  await db.schema.dropTable(tables.likes).execute();
  await db.schema.dropTable(tables.membership_tiers_benefits).execute();
  await db.schema.dropTable(tables.membership_benefits).execute();
  await db.schema.dropTable(tables.membership_tiers).execute();
  await db.schema.dropTable(tables.post_collection_posts).execute();
  await db.schema.dropTable(tables.post_collections).execute();
  await db.schema.dropTable(tables.posts).execute();
  await db.schema.dropTable(tables.profiles).execute();
  await db.schema.dropTable(tables.accounts).execute();

  await sql`DROP FUNCTION IF EXISTS update_updated_at_trigger;`.execute(db);
}
