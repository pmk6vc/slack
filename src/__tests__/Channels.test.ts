import type { Response as SuperTestResponse } from "supertest";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getApp, getPool, setupTestDb, teardownTestDb } from "./TestDbFixture";

let totalChannels = 0;

beforeAll(async () => {
  await setupTestDb();
  const pool = getPool();
  const res = await pool.query(`SELECT COUNT(*)::int AS c FROM channels`);
  totalChannels = Number(res.rows[0].c ?? 0);
});

afterAll(async () => {
  await teardownTestDb();
});

describe("Channels API pagination", () => {
  it("returns default page (<=50) and exposes nextCursor when more exists", async () => {
    const app = getApp();
    const res = await request(app).get("/channels");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(0);
    expect(res.body.data.length).toBeLessThanOrEqual(50);

    const expectedHasMore = totalChannels > res.body.data.length;
    expect(res.body.hasMore).toBe(expectedHasMore);
    if (expectedHasMore) {
      expect(typeof res.body.nextCursor).toBe("string");
    } else {
      expect(res.body.nextCursor).toBeNull();
    }
  });

  it("respects limit param and enforces upper bound 50", async () => {
    const app = getApp();

    const r10 = await request(app).get("/channels?limit=10");
    expect(r10.status).toBe(200);
    expect(r10.body.data.length).toBe(10);

    const r100 = await request(app).get("/channels?limit=100");
    expect(r100.status).toBe(200);
    // capped to 50
    expect(r100.body.data.length).toBeLessThanOrEqual(50);
  });

  it("rejects invalid limit values", async () => {
    const app = getApp();

    const r0 = await request(app).get("/channels?limit=0");
    expect(r0.status).toBe(400);

    const rNaN = await request(app).get("/channels?limit=abc");
    expect(rNaN.status).toBe(400);
  });

  it("rejects invalid cursor values", async () => {
    const app = getApp();
    const r = await request(app).get("/channels?cursor=not-a-valid-cursor");
    expect(r.status).toBe(400);
  });

  it("iterates through all pages using nextCursor without duplicates", async () => {
    const app = getApp();
    const pageSize = 20;
    let allIds: string[] = [];
    let nextCursor: string | null = null;
    let round = 0;

    do {
      const url: string = nextCursor
        ? `/channels?limit=${pageSize}&cursor=${encodeURIComponent(nextCursor)}`
        : `/channels?limit=${pageSize}`;
      const r: SuperTestResponse = await request(app).get(url);
      expect(r.status).toBe(200);
      const rows = r.body.data as Array<{ channel_id: string }>;
      // collect ids
      allIds = allIds.concat(rows.map((c) => c.channel_id));
      nextCursor = r.body.hasMore ? r.body.nextCursor : null;
      round += 1;
      // safety: prevent infinite loops
      expect(round).toBeLessThan(1000);
    } while (nextCursor);

    // ensure we collected exactly the number of channels in the DB
    const pool = getPool();
    const res = await pool.query(`SELECT COUNT(*)::int AS c FROM channels`);
    const dbCount = Number(res.rows[0].c ?? 0);
    expect(allIds.length).toBe(dbCount);

    // ensure uniqueness
    const unique = new Set(allIds);
    expect(unique.size).toBe(allIds.length);
  });
});
