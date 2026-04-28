import "dotenv/config";
import path from "node:path";
import { NativeConnection, Worker } from "@temporalio/worker";
import { env } from "./config/env";
import { activities } from "./activities";

function validateStartupEnv(): void {
  const missing: string[] = [];

  if (!env.geminiApiKey.trim()) {
    missing.push("GEMINI_API_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Set them in apps/temporal/.env before starting the worker.",
    );
  }
}

async function run(): Promise<void> {
  validateStartupEnv();

  const connection = await NativeConnection.connect({
    address: env.temporalAddress,
  });

  const worker = await Worker.create({
    workflowsPath: path.resolve(__dirname, "workflows", "index.ts"),
    activities,
    taskQueue: env.temporalTaskQueue,
    connection,
  });

  console.log(`Worker listening on task queue: ${env.temporalTaskQueue}`);
  await worker.run();
}

run().catch((error) => {
  console.error("Worker failed to start:", error);
  process.exit(1);
});
