export const env = {
  temporalAddress: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
  temporalTaskQueue: process.env.TEMPORAL_TASK_QUEUE ?? "audio-analysis",
} as const;
