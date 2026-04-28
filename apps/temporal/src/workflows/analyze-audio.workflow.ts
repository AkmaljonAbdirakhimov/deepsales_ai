import { proxyActivities } from "@temporalio/workflow";
import type { AnalyzeAudioInput, AnalysisActivities, AnalysisResult } from "../types";

const { validateAudio, transcribeAudio, analyzeConversation } = proxyActivities<AnalysisActivities>({
  startToCloseTimeout: "2 minutes",
  retry: {
    initialInterval: "1 second",
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

export async function analyzeAudioWorkflow(input: AnalyzeAudioInput): Promise<AnalysisResult> {
  await validateAudio(input);
  const transcript = await transcribeAudio(input);
  return analyzeConversation(transcript);
}
