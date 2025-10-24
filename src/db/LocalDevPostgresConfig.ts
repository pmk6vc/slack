import { PostgreSqlContainer } from "@testcontainers/postgresql";
import PostgresConfig from "./PostgresConfig.js";

export default class LocalDevPostgresConfig extends PostgresConfig {
  static override async getInstance(): Promise<LocalDevPostgresConfig> {
    const container = await new PostgreSqlContainer(
      "postgres:17-alpine",
    ).start();
    return super.getInstance({
      username: container.getUsername(),
      password: container.getPassword(),
      host: container.getHost(),
      port: container.getPort(),
      database: container.getDatabase(),
    });
  }
}
