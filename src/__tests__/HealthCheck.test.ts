import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

// Build a minimal app instance without starting testcontainer — ping endpoint doesn't need DB
const dummyConfig = {
  // minimal shape: getPool and close must exist; use LocalDockerPostgresConfig to satisfy typing only when needed
} as any;

const app = buildApp(dummyConfig);

describe("Health API", () => {
  it("responds to ping", async () => {
    const res = await request(app).get("/ping");
    expect(res.status).toBe(200);
    expect(res.text).toBe("ping");
  });
});
