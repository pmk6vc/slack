import { buildApp } from "./app.js";
import PostgresConfigFactory from "./db/PostgresConfigFactory.js";

const pgConfig = await PostgresConfigFactory.getPostgresConfig();
const app = buildApp(pgConfig);
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Graceful shutdown: close Postgres pool
const shutdown = async () => {
  console.log("Shutting down, closing DB pool...");
  try {
    await pgConfig.close();
  } catch (err) {
    console.error("Error closing DB pool:", err);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
