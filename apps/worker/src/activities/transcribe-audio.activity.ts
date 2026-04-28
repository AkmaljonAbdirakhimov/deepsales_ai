import type { AnalyzeAudioInput } from "../types";

export async function transcribeAudio(input: AnalyzeAudioInput): Promise<string> {
  return `Mock transcript generated for audio file: ${input.audioPath}`;
}
