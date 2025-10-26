import { Request, Response, Router } from "express";
import PostgresConfig from "../db/PostgresConfig";

function encodeCursor(channelId: string) {
  return Buffer.from(JSON.stringify({ channel_id: channelId })).toString(
    "base64",
  );
}

function decodeCursor(cursor: string) {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as { channel_id?: string };
    return parsed.channel_id ?? null;
  } catch {
    return null;
  }
}

export default function createChannelsRouter(config: PostgresConfig): Router {
  const router = Router();

  // GET / -> returns channels with cursor-based pagination by channel_id
  router.get("/", async (req: Request, res: Response) => {
    // Extract last visited cursor
    const cursorRaw =
      typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    let afterChannelId: string | null = null;
    if (cursorRaw) {
      afterChannelId = decodeCursor(cursorRaw);
      if (!afterChannelId) {
        return res.status(400).json({ error: "Invalid cursor" });
      }
    }

    // Extract requested page limit
    let pageLimit = 50;
    const limitRaw =
      typeof req.query.limit === "string" ? req.query.limit : undefined;
    if (limitRaw) {
      const parsedLimit = parseInt(limitRaw, 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return res.status(400).json({ error: "Invalid limit" });
      }
      pageLimit = Math.min(parsedLimit, 50);
    }

    // TODO: Add filtering, e.g., by channel name, creation date, etc.
    // Get raw results

    let rows;
    if (afterChannelId) {
      const query = `
        SELECT * FROM channels
        WHERE channel_id > $1::uuid
        ORDER BY channel_id ASC
        LIMIT $2
      `;
      const result = await config
        .getPool()
        .query(query, [afterChannelId, pageLimit + 1]);
      rows = result.rows;
    } else {
      const query = `
        SELECT * FROM channels
        ORDER BY channel_id ASC
        LIMIT $1
      `;
      const result = await config.getPool().query(query, [pageLimit + 1]);
      rows = result.rows;
    }

    // Trim to page limit and set next cursor if there are more rows
    let nextCursor: string | null = null;
    if (rows.length > pageLimit) {
      rows = rows.slice(0, pageLimit);
      const last = rows[rows.length - 1];
      nextCursor = encodeCursor(last.channel_id);
    }
    const hasMore: boolean = Boolean(nextCursor);
    return res.json({ data: rows, nextCursor, hasMore });
  });

  return router;
}
