import { randomUUID } from "node:crypto";
import { env } from "../../config/env";
import { getTemporalClient } from "../client";

export async function startAudioAnalysisWorkflow(audioPath: string): Promise<string> {
  const client = await getTemporalClient();
  const workflowId = `audio-${randomUUID()}`;

  await client.workflow.start("analyzeAudioWorkflow", {
    taskQueue: env.temporalTaskQueue,
    workflowId,
    args: [{ audioPath }],
  });

  return workflowId;
}
