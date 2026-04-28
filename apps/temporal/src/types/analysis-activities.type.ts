import type { AnalyzeAudioInput } from "./analyze-audio-input.type";
import type { AnalysisResult } from "./analysis-result.type";

export interface AnalysisActivities {
  validateAudio(input: AnalyzeAudioInput): Promise<void>;
  transcribeAudio(input: AnalyzeAudioInput): Promise<string>;
  analyzeConversation(transcript: string): Promise<AnalysisResult>;
  cleanupAudioFile(input: AnalyzeAudioInput): Promise<void>;
}
