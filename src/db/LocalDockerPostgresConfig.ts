import PostgresConfig from "./PostgresConfig";

export default class LocalDockerPostgresConfig extends PostgresConfig {
  static override getInstance(): LocalDockerPostgresConfig {
    return super.getInstance({
      username: process.env.POSTGRES_USER!,
      password: process.env.POSTGRES_PASSWORD!,
      host: "localhost",
      port: Number(process.env.POSTGRES_PORT!),
      database: process.env.POSTGRES_DB!,
    });
  }
}
