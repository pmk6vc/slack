import {Router, Request, Response } from "express";
import PostgresConfig from "../db/PostgresConfig";

export default function createChannelsRouter(config: PostgresConfig): Router {
    const router = Router();

    // GET / -> returns all channels
    router.get("/", async (_req: Request, res: Response) => {
        try {
            const pool = config.getPool();
            const { rows } = await pool.query("SELECT * FROM channels");
            res.json(rows);
        } catch (err) {
            console.error("Failed to fetch channels:", err);
            res.status(500).json({ error: "Failed to fetch channels" });
        }
    });

    return router;
}
