import path from "node:path";
import type { AnalyzeAudioInput } from "../types";
import { deleteFile, generateContent, uploadFile } from "../services/gemini-client";

function detectAudioMimeType(audioPath: string): string {
  const extension = path.extname(audioPath).toLowerCase();
  switch (extension) {
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".ogg":
      return "audio/ogg";
    case ".m4a":
      return "audio/mp4";
    default:
      return "application/octet-stream";
  }
}

export async function transcribeAudio(input: AnalyzeAudioInput): Promise<string> {
  const mimeType = detectAudioMimeType(input.audioPath);
  const uploadedFile = await uploadFile(input.audioPath, mimeType);
  if (!uploadedFile.uri || !uploadedFile.name) {
    throw new Error("Gemini file upload succeeded but missing file URI or name.");
  }

  try {
    const prompt = [
      "Transcribe this sales call audio exactly.",
      "Output plain text only.",
      "Do not add commentary, formatting, or labels.",
    ].join(" ");

    const transcript = await generateContent(prompt, {
      fileUri: uploadedFile.uri,
      fileMimeType: mimeType,
    });

    if (!transcript.trim()) {
      throw new Error("Gemini returned empty transcription.");
    }

    return transcript.trim();
  } finally {
    await deleteFile(uploadedFile.name);
  }
}
