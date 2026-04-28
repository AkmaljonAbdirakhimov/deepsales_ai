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
  const { cleanupAudioFile } = proxyActivities<AnalysisActivities>({
    startToCloseTimeout: "1 minute",
    retry: {
      initialInterval: "1 second",
      backoffCoefficient: 2,
      maximumAttempts: 3,
    },
  });

  try {
    await validateAudio(input);
    const transcript = await transcribeAudio(input);
    return analyzeConversation(transcript);
  } finally {
    await cleanupAudioFile(input);
  }
}
