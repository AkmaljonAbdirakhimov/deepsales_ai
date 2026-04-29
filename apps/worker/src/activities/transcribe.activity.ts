import { log } from "@temporalio/activity";
import { uploadFile, deleteFile, generateContent } from "@deepsales/ai";
import type { UploadedFile } from "@deepsales/ai";

export interface TranscribeInput {
  callId: string;
  /** Absolute path to the audio file on the worker's local filesystem */
  audioPath: string;
  tenantId: string;
}

export interface TranscribeResult {
  transcript: string;
  language: string;
  durationSeconds: number | null;
}

/**
 * 1. Downloads audio from the CRM-provided URL.
 * 2. Uploads it to Gemini Files API.
 * 3. Sends a transcription prompt referencing the uploaded file.
 * 4. Deletes the file to free quota.
 */
export async function transcribeAudio(input: TranscribeInput): Promise<TranscribeResult> {
  log.info("Uploading audio to Gemini Files API", { callId: input.callId });

  const uploaded: UploadedFile = await uploadFile(
    input.audioPath,
    `call-${input.callId}`,
  );

  log.info("Audio uploaded, requesting transcription", {
    callId: input.callId,
    fileUri: uploaded.fileUri,
  });

  try {
    const raw = await generateContent([
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: uploaded.fileUri,
              mimeType: uploaded.mimeType,
            },
          },
          {
            text: `You are a professional call transcription service.

Transcribe the full audio conversation verbatim.
Label each speaker turn as "Agent:" or "Client:".
Preserve filler words, pauses (as "[pause]"), and unclear parts (as "[unclear]").
Detect the spoken language.

Respond in strict JSON (no markdown) matching this structure:
{
  "transcript": "<full verbatim transcript with speaker labels>",
  "language": "<ISO 639-1 code, e.g. en, ru, uz>",
  "durationSeconds": <number or null>
}`,
          },
        ],
      },
    ]);

    const result = parseJson<TranscribeResult>(raw, {
      transcript: "",
      language: "unknown",
      durationSeconds: null,
    });

    log.info("Transcription complete", {
      callId: input.callId,
      language: result.language,
      charCount: result.transcript.length,
    });

    return result;
  } finally {
    await deleteFile(uploaded.fileUri).catch((err) =>
      log.warn("Failed to delete Gemini file", { fileUri: uploaded.fileUri, err }),
    );
  }
}

function parseJson<T>(text: string, fallback: T): T {
  try {
    const clean = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(clean) as T;
  } catch {
    return fallback;
  }
}
