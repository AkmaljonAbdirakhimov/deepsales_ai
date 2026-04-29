import { log } from "@temporalio/activity";
import { generateContent } from "@deepsales/ai";

export interface AnalysisResult {
  scriptAdherenceScore: number;
  talkRatioAgent: number;
  talkRatioClient: number;
  objectionHandlingScore: number;
  mistakesCount: number;
  sentimentScore: number;
  leadQualityScore: number;
  category: string;
  summary: string;
  mistakes: string[];
  objections: string[];
}

export interface AnalyzeInput {
  callId: string;
  tenantId: string;
  transcript: string;
  context?: {
    industry?: string;
    salesScript?: string;
  };
}

const ANALYSIS_FALLBACK: AnalysisResult = {
  scriptAdherenceScore: 0,
  talkRatioAgent: 0.5,
  talkRatioClient: 0.5,
  objectionHandlingScore: 0,
  mistakesCount: 0,
  sentimentScore: 0,
  leadQualityScore: 0,
  category: "other",
  summary: "",
  mistakes: [],
  objections: [],
};

/**
 * Sends the transcript to Gemini with a structured analysis prompt
 * and returns sales metrics as a typed object.
 */
export async function analyzeCall(input: AnalyzeInput): Promise<AnalysisResult> {
  log.info("Analyzing call transcript", {
    callId: input.callId,
    transcriptLength: input.transcript.length,
  });

  const contextBlock = input.context
    ? [
        `Industry: ${input.context.industry ?? "general sales"}`,
        input.context.salesScript
          ? `Sales script summary:\n${input.context.salesScript}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const raw = await generateContent([
    {
      role: "user",
      parts: [
        {
          text: `You are an expert sales call analyst.
${contextBlock ? `\n${contextBlock}\n` : ""}
Analyze the following sales call transcript and return ONLY a strict JSON object (no markdown, no explanation):
{
  "scriptAdherenceScore": <0-100>,
  "talkRatioAgent": <0.0-1.0 fraction of speaking time by agent>,
  "talkRatioClient": <0.0-1.0 fraction of speaking time by client>,
  "objectionHandlingScore": <0-100>,
  "mistakesCount": <integer>,
  "sentimentScore": <-1.0 to 1.0>,
  "leadQualityScore": <0-100>,
  "category": "<cold_call | follow_up | demo | complaint | support | other>",
  "summary": "<2-4 sentence summary>",
  "mistakes": ["<mistake>"],
  "objections": ["<objection>"]
}

TRANSCRIPT:
${input.transcript}`,
        },
      ],
    },
  ]);

  const result = parseJson<AnalysisResult>(raw, ANALYSIS_FALLBACK);

  log.info("Analysis complete", {
    callId: input.callId,
    category: result.category,
    scriptAdherenceScore: result.scriptAdherenceScore,
    leadQualityScore: result.leadQualityScore,
  });

  return result;
}

/**
 * Lightweight category detection — runs before the full pipeline
 * for fast routing or filtering without a full analysis pass.
 */
export async function detectCategory(input: {
  callId: string;
  transcript: string;
}): Promise<string> {
  log.info("Detecting call category", { callId: input.callId });

  const raw = await generateContent([
    {
      role: "user",
      parts: [
        {
          text: `Classify this sales call into exactly one category.
Return ONLY JSON: { "category": "<value>" }
Categories: cold_call | follow_up | demo | complaint | support | other

TRANSCRIPT:
${input.transcript}`,
        },
      ],
    },
  ]);

  const parsed = parseJson<{ category: string }>(raw, { category: "other" });
  return parsed.category;
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
