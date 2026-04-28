export type WorkflowStatus =
  | "STATUS_UNSPECIFIED"
  | "STATUS_RUNNING"
  | "STATUS_COMPLETED"
  | "STATUS_FAILED"
  | "STATUS_CANCELED"
  | "STATUS_TERMINATED"
  | "STATUS_CONTINUED_AS_NEW"
  | "STATUS_TIMED_OUT";

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
