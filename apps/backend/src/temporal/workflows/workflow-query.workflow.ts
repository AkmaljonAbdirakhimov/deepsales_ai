import { getTemporalClient } from "../client";

export async function describeWorkflow(workflowId: string) {
  const client = await getTemporalClient();
  const handle = client.workflow.getHandle(workflowId);
  return handle.describe();
}

export async function getWorkflowResult(workflowId: string) {
  const client = await getTemporalClient();
  const handle = client.workflow.getHandle(workflowId);
  return handle.result();
}
