import { Pool } from "pg";

export default class PostgresConfig {
  protected static instance: PostgresConfig | null = null;

  protected readonly username: string;
  protected readonly password: string;
  protected readonly host: string;
  protected readonly port: number;
  protected readonly database: string;
  protected readonly databasePool: Pool;

  protected constructor(
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

  static async getInstance(config: {
    username: string;
    password: string;
    host: string;
    port: number;
    database: string;
  }): Promise<PostgresConfig> {
    if (!PostgresConfig.instance) {
      PostgresConfig.instance = new PostgresConfig(
        config.username,
        config.password,
        config.host,
        config.port,
        config.database,
      );
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
