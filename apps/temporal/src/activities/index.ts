import type { AnalysisActivities } from "../types";
import { analyzeConversation } from "./analyze-conversation.activity";
import { cleanupAudioFile } from "./cleanup-audio-file.activity";
import { transcribeAudio } from "./transcribe-audio.activity";
import { validateAudio } from "./validate-audio.activity";

export const activities: AnalysisActivities = {
  validateAudio,
  transcribeAudio,
  analyzeConversation,
  cleanupAudioFile,
};
