import fs from "node:fs/promises";
import type { AnalyzeAudioInput } from "../types";

export async function validateAudio(input: AnalyzeAudioInput): Promise<void> {
  await fs.access(input.audioPath);
}
