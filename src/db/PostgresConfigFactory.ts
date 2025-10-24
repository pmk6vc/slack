import LocalDevPostgresConfig from "./LocalDevPostgresConfig";
import LocalDockerPostgresConfig from "./LocalDockerPostgresConfig";
import PostgresConfig from "./PostgresConfig";

export default class PostgresConfigFactory {
  static async getPostgresConfig(): Promise<PostgresConfig> {
    const env = (process.env.NODE_CONFIG_ENV ?? "dev").toLowerCase();
    if (env === "local-docker") {
      return await LocalDockerPostgresConfig.getInstance();
    }
    return await LocalDevPostgresConfig.getInstance();
  }
}
