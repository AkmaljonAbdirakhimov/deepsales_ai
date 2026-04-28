export const WORKFLOW_STATUS = {
  UNSPECIFIED: "UNSPECIFIED",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELED: "CANCELED",
  TERMINATED: "TERMINATED",
  CONTINUED_AS_NEW: "CONTINUED_AS_NEW",
  TIMED_OUT: "TIMED_OUT",
} as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUS)[keyof typeof WORKFLOW_STATUS];

const workflowStatusAliasMap: Record<string, WorkflowStatus> = {
  STATUS_UNSPECIFIED: WORKFLOW_STATUS.UNSPECIFIED,
  STATUS_RUNNING: WORKFLOW_STATUS.RUNNING,
  STATUS_COMPLETED: WORKFLOW_STATUS.COMPLETED,
  STATUS_FAILED: WORKFLOW_STATUS.FAILED,
  STATUS_CANCELED: WORKFLOW_STATUS.CANCELED,
  STATUS_TERMINATED: WORKFLOW_STATUS.TERMINATED,
  STATUS_CONTINUED_AS_NEW: WORKFLOW_STATUS.CONTINUED_AS_NEW,
  STATUS_TIMED_OUT: WORKFLOW_STATUS.TIMED_OUT,
};

export function parseWorkflowStatus(rawStatus: string): WorkflowStatus {
  if (rawStatus in WORKFLOW_STATUS) {
    return WORKFLOW_STATUS[rawStatus as keyof typeof WORKFLOW_STATUS];
  }

  return workflowStatusAliasMap[rawStatus] ?? WORKFLOW_STATUS.UNSPECIFIED;
}

export interface AnalysisMetrics {
  scriptAdherenceScore: number | null;
  talkRatio: number | null;
  objectionHandlingScore: number | null;
  mistakesCount: number | null;
  sentimentScore: number | null;
  leadQualityScore: number | null;
}

export interface AnalysisResult {
  transcript: string;
  category: string | null;
  metrics: AnalysisMetrics;
  summary: string | null;
}

export interface WorkflowStatusResponse {
  workflowId: string;
  status: WorkflowStatus;
  startTime?: string;
  closeTime?: string;
}
