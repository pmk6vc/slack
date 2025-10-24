import express from "express";
import HealthCheckRouter from "./api/HealthCheckRouter";
import type PostgresConfig from "./db/PostgresConfig";
import createChannelsRouter from "./api/ChannelsRouter";

const app = express();
export const buildApp = (pgConfig: PostgresConfig) => {
  // Use middlewares in order of evaluation
  app.use(express.json());

  // Attach routers in order of evaluation
  app.use("/ping", HealthCheckRouter);
  app.use("/channels", createChannelsRouter(pgConfig))
};
