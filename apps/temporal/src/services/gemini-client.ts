import { createPartFromText, createPartFromUri, GoogleGenAI } from "@google/genai";
import { env } from "../config/env";

interface GeminiRequestOptions {
  fileUri?: string;
  fileMimeType?: string;
  responseMimeType?: string;
}

let geminiClient: GoogleGenAI | undefined;

function getGeminiClient(): GoogleGenAI {
  if (!env.geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY for Temporal activities.");
  }

  if (geminiClient) {
    return geminiClient;
  }

  geminiClient = new GoogleGenAI({ apiKey: env.geminiApiKey });
  return geminiClient;
}

export async function generateContent(
  prompt: string,
  options?: GeminiRequestOptions,
): Promise<string> {
  const ai = getGeminiClient();

  const parts = [createPartFromText(prompt)];

  if (options?.fileUri && options?.fileMimeType) {
    parts.push(createPartFromUri(options.fileUri, options.fileMimeType));
  }

  const response = await ai.models.generateContent({
    model: env.geminiModel,
    contents: [{ role: "user", parts }],
    config: options?.responseMimeType
      ? {
          responseMimeType: options.responseMimeType,
        }
      : undefined,
  });

  return response.text ?? "";
}

export async function uploadFile(filePath: string, mimeType: string) {
  const ai = getGeminiClient();
  return ai.files.upload({
    file: filePath,
    config: { mimeType },
  });
}

export async function deleteFile(fileName: string): Promise<void> {
  const ai = getGeminiClient();
  await ai.files.delete({ name: fileName });
}
