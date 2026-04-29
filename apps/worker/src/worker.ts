import { NativeConnection, Worker } from "@temporalio/worker";
import { transcribeAudio } from "./activities/transcribe.activity";
import { analyzeCall, detectCategory } from "./activities/analyze.activity";
import { syncToCrm } from "./activities/crm-sync.activity";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Set it in .env (root) before starting the worker.`,
    );
  }
  return v;
}

async function run() {
  const address = requireEnv("TEMPORAL_ADDRESS");
  const namespace = process.env.TEMPORAL_NAMESPACE ?? "default";

  const connection = await NativeConnection.connect({ address });

  const worker = await Worker.create({
    connection,
    namespace,
    workflowsPath: require.resolve("./workflows/call-processing.workflow"),
    activities: {
      transcribeAudio,
      analyzeCall,
      detectCategory,
      syncToCrm,
    },
    taskQueue: "call-processing",
  });

  console.log(
    `Temporal worker started — ${address} / ${namespace} / call-processing`,
  );
  await worker.run();
}

run().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});
