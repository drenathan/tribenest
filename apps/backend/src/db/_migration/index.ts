import { Argument, program } from "commander";
import { create, migrateDown, migrateToLatest, migrationStatus } from "./migrator";

async function cli() {
  program.name("migrate").showHelpAfterError().description("migrate mongo database");

  program
    .command("create")
    .description("create a new migration")
    .addArgument(new Argument("description", "description of the migration").argRequired())
    .action(async (description) => {
      console.log("Creating migration:", description);
      const name = create(description);
      console.log("Migration created:", name);
    });

  program
    .command("up")
    .description("apply pending migrations")
    .action(async () => {
      console.log("Applying migrations");

      await migrateToLatest();
    });

  program
    .command("down")
    .description("rollback last migration")
    .action(async () => {
      console.log("Rolling back migration");

      await migrateDown();
    });

  program
    .command("status")
    .description("show migration status")
    .action(async () => {
      await migrationStatus();
    });

  await program.parseAsync(process.argv);
}

cli().catch((error) => {
  console.error(error);
  process.exit(1);
});
