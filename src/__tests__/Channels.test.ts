import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getApp, getPool, setupTestDb, teardownTestDb } from "./TestDbFixture";

beforeAll(async () => {
  await setupTestDb();
  const pool = getPool();
  await pool.query(
    `INSERT INTO channels (channel_id, name) VALUES (uuid_generate_v4(), 'general')`,
  );
});

afterAll(async () => {
  await teardownTestDb();
});

describe("Channels API", () => {
  it("returns list of channels", async () => {
    const app = getApp();
    const res = await request(app).get("/channels");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("channel_id");
    expect(res.body[0]).toHaveProperty("name");
  });
});
