import type { AnalysisResult } from "../types";
import { generateContent } from "../services/gemini-client";

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const markdownMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (markdownMatch?.[1]) {
    return markdownMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export async function analyzeConversation(transcript: string): Promise<AnalysisResult> {
  const prompt = `
You are analyzing a sales call transcript.
Return ONLY a valid JSON object with this exact shape:
{
  "category": "string",
  "summary": "string",
  "metrics": {
    "scriptAdherenceScore": number,
    "talkRatio": number,
    "objectionHandlingScore": number,
    "mistakesCount": number,
    "sentimentScore": number,
    "leadQualityScore": number
  }
}
Rules:
- Use 0..100 scale for scores.
- talkRatio should be a decimal between 0 and 1.
- Output JSON only, no markdown fences.

Transcript:
${transcript}
`.trim();

  const modelOutput = await generateContent(prompt, {
    responseMimeType: "application/json",
  });

  let parsed: {
    category?: unknown;
    summary?: unknown;
    metrics?: {
      scriptAdherenceScore?: unknown;
      talkRatio?: unknown;
      objectionHandlingScore?: unknown;
      mistakesCount?: unknown;
      sentimentScore?: unknown;
      leadQualityScore?: unknown;
    };
  };

  try {
    parsed = JSON.parse(extractJsonObject(modelOutput));
  } catch (error) {
    throw new Error(
      `Failed to parse Gemini analysis JSON: ${error instanceof Error ? error.message : "Unknown parse error"}`,
    );
  }

  return {
    transcript,
    category: typeof parsed.category === "string" && parsed.category ? parsed.category : null,
    metrics: {
      scriptAdherenceScore: nullableNumber(parsed.metrics?.scriptAdherenceScore),
      talkRatio: nullableNumber(parsed.metrics?.talkRatio),
      objectionHandlingScore: nullableNumber(parsed.metrics?.objectionHandlingScore),
      mistakesCount: nullableNumber(parsed.metrics?.mistakesCount),
      sentimentScore: nullableNumber(parsed.metrics?.sentimentScore),
      leadQualityScore: nullableNumber(parsed.metrics?.leadQualityScore),
    },
    summary: typeof parsed.summary === "string" && parsed.summary ? parsed.summary : null,
  };
}
