import { GoogleGenAI, type UploadFileConfig, type Content } from "@google/genai";
import * as path from "path";

// ─── Singleton ────────────────────────────────────────────────────────────────

let _client: GoogleGenAI | null = null;

export function getClient(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedFile {
  /** Gemini Files API URI — pass directly as fileData part in prompts */
  fileUri: string;
  mimeType: string;
  displayName: string;
}

// ─── Files API ────────────────────────────────────────────────────────────────

/**
 * Upload a local file to Gemini Files API.
 * Supported audio types: mp3, mp4, wav, ogg, flac, m4a, webm, aac, opus.
 */
export async function uploadFile(
  filePath: string,
  displayName: string,
): Promise<UploadedFile> {
  const client = getClient();
  const mimeType = guessMimeType(filePath);

  const config: UploadFileConfig = { mimeType, displayName };

  const response = await client.files.upload({ file: filePath, config });

  if (!response.uri) {
    throw new Error("Gemini Files API did not return a file URI");
  }

  return { fileUri: response.uri, mimeType, displayName };
}

/**
 * Delete a file from Gemini Files API to free quota.
 * fileUri format: "https://generativelanguage.googleapis.com/v1beta/files/<name>"
 */
export async function deleteFile(fileUri: string): Promise<void> {
  const client = getClient();
  const fileName = fileUri.split("/").slice(-2).join("/"); // "files/<name>"
  await client.files.delete({ name: fileName });
}

// ─── Generation ───────────────────────────────────────────────────────────────

/**
 * Generic content generation. Pass any Gemini-compatible contents array.
 * Returns the raw text from the first candidate.
 */
export async function generateContent(
  contents: Content[],
  model = "gemini-2.0-flash",
): Promise<string> {
  const client = getClient();
  const response = await client.models.generateContent({ model, contents });
  return response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function guessMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".mp4": "audio/mp4",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
    ".webm": "audio/webm",
    ".aac": "audio/aac",
    ".opus": "audio/opus",
  };
  return map[ext] ?? "audio/mpeg";
}
