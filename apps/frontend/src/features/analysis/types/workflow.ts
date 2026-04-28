export enum WorkflowStatus {
  UNSPECIFIED = "UNSPECIFIED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELED = "CANCELED",
  TERMINATED = "TERMINATED",
  CONTINUED_AS_NEW = "CONTINUED_AS_NEW",
  TIMED_OUT = "TIMED_OUT",
}

const workflowStatusAliasMap: Record<string, WorkflowStatus> = {
  STATUS_UNSPECIFIED: WorkflowStatus.UNSPECIFIED,
  STATUS_RUNNING: WorkflowStatus.RUNNING,
  STATUS_COMPLETED: WorkflowStatus.COMPLETED,
  STATUS_FAILED: WorkflowStatus.FAILED,
  STATUS_CANCELED: WorkflowStatus.CANCELED,
  STATUS_TERMINATED: WorkflowStatus.TERMINATED,
  STATUS_CONTINUED_AS_NEW: WorkflowStatus.CONTINUED_AS_NEW,
  STATUS_TIMED_OUT: WorkflowStatus.TIMED_OUT,
};

export function parseWorkflowStatus(rawStatus: string): WorkflowStatus {
  if (rawStatus in WorkflowStatus) {
    return WorkflowStatus[rawStatus as keyof typeof WorkflowStatus];
  }

  return workflowStatusAliasMap[rawStatus] ?? WorkflowStatus.UNSPECIFIED;
}

export interface AnalysisMetrics {
  scriptAdherenceScore: number;
  talkRatio: number;
  objectionHandlingScore: number;
  mistakesCount: number;
  sentimentScore: number;
  leadQualityScore: number;
}

export interface AnalysisResult {
  transcript: string;
  category: string;
  metrics: AnalysisMetrics;
  summary: string;
}

export interface WorkflowStatusResponse {
  workflowId: string;
  status: WorkflowStatus;
  startTime?: string;
  closeTime?: string;
}
