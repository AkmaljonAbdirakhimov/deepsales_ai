import type { AnalysisResult } from "../types";

export async function analyzeConversation(transcript: string): Promise<AnalysisResult> {
  return {
    transcript,
    category: "general-sales-call",
    metrics: {
      scriptAdherenceScore: 78,
      talkRatio: 0.62,
      objectionHandlingScore: 73,
      mistakesCount: 2,
      sentimentScore: 80,
      leadQualityScore: 75,
    },
    summary:
      "The conversation followed most of the script. The manager handled objections adequately and showed generally positive sentiment.",
  };
}
