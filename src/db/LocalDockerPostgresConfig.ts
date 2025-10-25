import PostgresConfig from "./PostgresConfig.js";

export default class LocalDockerPostgresConfig extends PostgresConfig {
  static override async getInstance(): Promise<LocalDockerPostgresConfig> {
    return super.getInstance({
      username: process.env.POSTGRES_USER!,
      password: process.env.POSTGRES_PASSWORD!,
      host: process.env.POSTGRES_HOST!,
      port: Number(process.env.POSTGRES_PORT!),
      database: process.env.POSTGRES_DB!,
    });
  }
}
