import { Worker } from "@temporalio/worker";
import { transcribeAudio } from "./activities/transcribe.activity";
import { analyzeCall, detectCategory } from "./activities/analyze.activity";
import { syncToCrm } from "./activities/crm-sync.activity";

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve("./workflows/call-processing.workflow"),
    activities: {
      transcribeAudio,
      analyzeCall,
      detectCategory,
      syncToCrm,
    },
    taskQueue: "call-processing",
    namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
  });

  console.log("Temporal worker started — task queue: call-processing");
  await worker.run();
}

run().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});
