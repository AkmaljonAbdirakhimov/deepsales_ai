import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware";
import { analysisRouter } from "./routes/analysis.routes";
import { workflowRouter } from "./routes/workflow.routes";

const app = express();

app.use(cors());
app.use(analysisRouter);
app.use(workflowRouter);
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
