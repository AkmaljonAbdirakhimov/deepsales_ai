import fs from "node:fs/promises";
import type { AnalyzeAudioInput } from "../types";

export async function cleanupAudioFile(input: AnalyzeAudioInput): Promise<void> {
  try {
    await fs.unlink(input.audioPath);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== "ENOENT") {
      throw error;
    }
  }
}
