import * as path from "path";
import { Pool } from "pg";
import { copyFileSync, promises as fs } from "fs";
import { Kysely, Migrator, PostgresDialect, FileMigrationProvider } from "kysely";
import { getConfig } from "@src/configuration";
import CliTable3 from "cli-table3";
import chalk from "chalk";

const migrationDir = path.join(__dirname, "_changes");
const templateFilePath = path.join(__dirname, "template.ts");

export async function migrateToLatest() {
  const db = new Kysely({
    dialect: new PostgresDialect({
      pool: new Pool(getConfig("postgres")),
    }),
  });

  const migrator = new Migrator({
    db,
    allowUnorderedMigrations: true,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "_changes"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

export function create(description: string): string {
  const sanitizedDescription = description.replace(/[^a-zA-Z0-9_-]/g, "_");

  const destination = path.join(migrationDir, `${Date.now()}_${sanitizedDescription}.ts`);

  copyFileSync(templateFilePath, destination);

  return destination;
}

export async function migrateDown() {
  const db = new Kysely({
    dialect: new PostgresDialect({
      pool: new Pool(getConfig("postgres")),
    }),
  });

  const migrator = new Migrator({
    db,
    allowUnorderedMigrations: true,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "_changes"),
    }),
  });

  const { error, results } = await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

export async function migrationStatus() {
  const db = new Kysely({
    dialect: new PostgresDialect({
      pool: new Pool(getConfig("postgres")),
    }),
  });

  const migrator = new Migrator({
    db,
    allowUnorderedMigrations: true,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "_changes"),
    }),
  });

  const migrations = await migrator.getMigrations();

  const table = new CliTable3({ head: ["Name", "Applied At"] });

  migrations.forEach((migration) => {
    table.push([
      `${migration.executedAt ? chalk.green(migration.name) : chalk.red(migration.name)}`,
      migration.executedAt ? migration.executedAt.toISOString() : "",
    ]);
  });

  await db.destroy();
}
