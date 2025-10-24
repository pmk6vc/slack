import { Pool } from "pg";

export default class PostgresConfig {
  private static instance: PostgresConfig | null = null;

  protected readonly username: string;
  protected readonly password: string;
  protected readonly host: string;
  protected readonly port: number;
  protected readonly database: string;
  protected readonly databasePool: Pool;

  private constructor(
    username: string,
    password: string,
    host: string,
    port: number,
    database: string,
  ) {
    this.username = username;
    this.password = password;
    this.host = host;
    this.port = port;
    this.database = database;
    this.databasePool = new Pool({
      user: this.username,
      host: this.host,
      database: this.database,
      password: this.password,
      port: this.port,
    });
  }

  static getInstance(config?: {
    username: string;
    password: string;
    host: string;
    port: number;
    database: string;
  }): PostgresConfig {
    if (!PostgresConfig.instance) {
      if (config) {
        PostgresConfig.instance = new PostgresConfig(
          config.username,
          config.password,
          config.host,
          config.port,
          config.database,
        );
      } else {
        const username = process.env.POSTGRES_USER;
        const password = process.env.POSTGRES_PASSWORD;
        const host = process.env.POSTGRES_HOST || "localhost";
        const portStr = process.env.POSTGRES_PORT;
        const database = process.env.POSTGRES_DB;
        if (!username || !password || !portStr || !database) {
          throw new Error(
            "PostgresConfig not initialized: provide config to getInstance or set env vars POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB and POSTGRES_PORT",
          );
        }
        const port = Number(portStr);
        PostgresConfig.instance = new PostgresConfig(
          username,
          password,
          host,
          port,
          database,
        );
      }
    }

    return PostgresConfig.instance;
  }

  getPool(): Pool {
    return this.databasePool;
  }

  getConnectionString(): string {
    return `postgresql://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}`;
  }

  async closePool(): Promise<void> {
    await this.databasePool.end();
  }
}
