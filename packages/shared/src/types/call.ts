import type { CrmSource } from "./crm";

export type CallStatus = "pending" | "processing" | "completed" | "failed";

export interface CallAnalysisResult {
  scriptAdherenceScore: number;
  talkRatioAgent: number;
  talkRatioClient: number;
  objectionHandlingScore: number;
  mistakesCount: number;
  sentimentScore: number;
  leadQualityScore: number;
  category: string;
  summary: string;
}

export interface CallDto {
  id: string;
  tenantId: string;
  crmSource: CrmSource;
  crmLeadId: string;
  crmUserId: string;
  audioUrl: string;
  status: CallStatus;
  analysisResult: CallAnalysisResult | null;
  createdAt: string;
  updatedAt: string;
}
