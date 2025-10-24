import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { runner as migrate } from "node-pg-migrate";
import path from "path";
import PostgresConfig from "./PostgresConfig.js";

export default class LocalDevPostgresConfig extends PostgresConfig {
  static override async getInstance(): Promise<LocalDevPostgresConfig> {
    if (!LocalDevPostgresConfig.instance) {
      // Start container
      console.log("Starting local Postgres container for development...");
      const container = await new PostgreSqlContainer(
        "citusdata/citus:13.0.3",
      ).start();
      console.log("Local Postgres container started.");
      LocalDevPostgresConfig.instance = new LocalDevPostgresConfig(
        container.getUsername(),
        container.getPassword(),
        container.getHost(),
        container.getPort(),
        container.getDatabase(),
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
}
