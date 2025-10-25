import type { Pool } from "pg";
import { buildApp } from "../app.js";
import LocalDevPostgresConfig from "../db/LocalDevPostgresConfig.js";

let pgConfig: Awaited<
  ReturnType<typeof LocalDevPostgresConfig.getInstance>
> | null = null;
let app: ReturnType<typeof buildApp> | null = null;

export async function setupTestDb() {
  if (!pgConfig) {
    pgConfig = await LocalDevPostgresConfig.getInstance();
    app = buildApp(pgConfig);
  }
  return { pgConfig, app };
}

export async function teardownTestDb() {
  if (pgConfig) {
    try {
      await pgConfig.close();
    } finally {
      pgConfig = null;
      app = null;
    }
  }
}

export function getApp() {
  if (!app)
    throw new Error("Test app not initialized. Call setupTestDb first.");
  return app as ReturnType<typeof buildApp>;
}

export function getPool(): Pool {
  if (!pgConfig)
    throw new Error("Test DB not initialized. Call setupTestDb first.");
  return pgConfig.getPool();
}
