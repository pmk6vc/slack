import express from "express";
import createChannelsRouter from "./api/ChannelsRouter.js";
import HealthCheckRouter from "./api/HealthCheckRouter.js";
import type PostgresConfig from "./db/PostgresConfig.js";

const app = express();
export const buildApp = (pgConfig: PostgresConfig) => {
  // Use middlewares in order of evaluation
  app.use(express.json());

  // Attach routers in order of evaluation
  app.use("/ping", HealthCheckRouter);
  app.use("/channels", createChannelsRouter(pgConfig));

  return app;
};
