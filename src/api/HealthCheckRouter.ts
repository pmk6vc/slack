import { Request, Response, Router } from "express";

const HealthCheckRouter = Router();

HealthCheckRouter.get("/", (_req: Request, res: Response) => {
  res.type("text/plain").status(200).send("ping");
});

export default HealthCheckRouter;
