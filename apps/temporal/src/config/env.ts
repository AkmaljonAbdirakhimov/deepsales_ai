export const env = {
  temporalAddress: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
  temporalTaskQueue: process.env.TEMPORAL_TASK_QUEUE ?? "audio-analysis",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-3.0-flash-preview",
} as const;
