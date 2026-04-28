import {
  parseWorkflowStatus,
  type AnalysisResult,
  type WorkflowStatusResponse,
} from "../types/workflow";

const API_BASE_URL = "http://localhost:4000";

export async function startAudioAnalysis(audioFile: File): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioFile);

  const response = await fetch(`${API_BASE_URL}/analyze-upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to upload audio.");
  }

  const body = (await response.json()) as { workflowId: string };
  return body.workflowId;
}

export async function fetchWorkflowStatus(workflowId: string): Promise<WorkflowStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/status`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to fetch workflow status.");
  }
  const body = (await response.json()) as {
    workflowId: string;
    status: string;
    startTime?: string;
    closeTime?: string;
  };

  return {
    workflowId: body.workflowId,
    status: parseWorkflowStatus(body.status),
    startTime: body.startTime,
    closeTime: body.closeTime,
  };
}

export async function fetchWorkflowResult(workflowId: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/result`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to fetch workflow result.");
  }
  const body = (await response.json()) as { result: AnalysisResult };
  return body.result;
}
