import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import PostgresConfig from "../db/PostgresConfig.js";

// Build a minimal app instance without starting testcontainer — ping endpoint doesn't need DB
const dummyConfig = {} as PostgresConfig;
const app = buildApp(dummyConfig);

describe("Health API", () => {
  it("responds to ping", async () => {
    const res = await request(app).get("/ping");
    expect(res.status).toBe(200);
    expect(res.text).toBe("ping");
  });
});
