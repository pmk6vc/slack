import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { runner as migrate } from "node-pg-migrate";
import path from "path";
import PostgresConfig from "./PostgresConfig.js";

export default class LocalDevPostgresConfig extends PostgresConfig {
  private static startedContainer?: StartedPostgreSqlContainer;
  static override async getInstance(): Promise<LocalDevPostgresConfig> {
    if (!LocalDevPostgresConfig.instance) {
      // Start container
      console.log("Starting local Postgres container for development...");
      LocalDevPostgresConfig.startedContainer = await new PostgreSqlContainer(
        "citusdata/citus:13.0.3",
      ).start();
      console.log("Local Postgres container started.");
      LocalDevPostgresConfig.instance = new LocalDevPostgresConfig(
        LocalDevPostgresConfig.startedContainer.getUsername(),
        LocalDevPostgresConfig.startedContainer.getPassword(),
        LocalDevPostgresConfig.startedContainer.getHost(),
        LocalDevPostgresConfig.startedContainer.getPort(),
        LocalDevPostgresConfig.startedContainer.getDatabase(),
      );

      // Run migrations
      const migrationsDir = path.resolve(process.cwd(), "migrations");
      const connectionString =
        LocalDevPostgresConfig.instance.getConnectionString();
      console.log(
        `Running migrations from ${migrationsDir} against ${connectionString}`,
      );
      await migrate({
        databaseUrl: connectionString,
        dir: migrationsDir,
        direction: "up",
        migrationsTable: "pgmigrations",
        // avoid acquiring a global lock in ephemeral test DBs
        noLock: true,
        // keep logs visible in stdout
        log: (msg: string) => console.log(msg),
      });
    }

    return LocalDevPostgresConfig.instance;
  }

  override async closePool(): Promise<void> {
    await super.closePool();
    if (LocalDevPostgresConfig.startedContainer) {
      await LocalDevPostgresConfig.startedContainer.stop();
      LocalDevPostgresConfig.startedContainer = undefined;
    }
  }
}
