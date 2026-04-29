import { proxyActivities } from "@temporalio/workflow";
import type { TranscribeInput, TranscribeResult } from "../activities/transcribe.activity";
import type { AnalyzeInput, AnalysisResult } from "../activities/analyze.activity";
import type { CrmSyncInput } from "../activities/crm-sync.activity";

const { transcribeAudio } = proxyActivities<{
  transcribeAudio(input: TranscribeInput): Promise<TranscribeResult>;
}>({
  startToCloseTimeout: "15 minutes", // audio upload + transcription can be slow
  retry: { maximumAttempts: 3, initialInterval: "5s", backoffCoefficient: 2 },
});

const { analyzeCall } = proxyActivities<{
  analyzeCall(input: AnalyzeInput): Promise<AnalysisResult>;
}>({
  startToCloseTimeout: "5 minutes",
  retry: { maximumAttempts: 3, initialInterval: "3s", backoffCoefficient: 2 },
});

const { syncToCrm } = proxyActivities<{
  syncToCrm(input: CrmSyncInput): Promise<void>;
}>({
  startToCloseTimeout: "2 minutes",
  retry: { maximumAttempts: 5, initialInterval: "2s", backoffCoefficient: 1.5 },
});

export interface CallProcessingInput {
  callId: string;
  tenantId: string;
  /** Absolute path to the downloaded audio file on the worker filesystem */
  audioPath: string;
  crmSource: "amocrm" | "bitrix24" | "odoo";
  crmLeadId: string;
  crmUserId: string;
  /** Optional: used to improve analysis accuracy */
  context?: {
    industry?: string;
    salesScript?: string;
  };
}

/**
 * Global call processing workflow:
 * 1. Upload audio → Gemini Files API → transcribe
 * 2. Analyse transcript (scores, category, mistakes, objections)
 * 3. Sync results back to CRM (note + field updates + task)
 */
export async function callProcessingWorkflow(
  input: CallProcessingInput,
): Promise<AnalysisResult> {
  const { transcript, language, durationSeconds } = await transcribeAudio({
    callId: input.callId,
    audioPath: input.audioPath,
    tenantId: input.tenantId,
  });

  const analysis = await analyzeCall({
    callId: input.callId,
    tenantId: input.tenantId,
    transcript,
    context: input.context,
  });

  // language + durationSeconds available for enriching CRM notes later
  void language;
  void durationSeconds;

  await syncToCrm({
    callId: input.callId,
    tenantId: input.tenantId,
    crmSource: input.crmSource,
    crmLeadId: input.crmLeadId,
    crmUserId: input.crmUserId,
    analysis,
  });

  return analysis;
}
