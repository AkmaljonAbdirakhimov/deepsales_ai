export const env = {
  port: Number(process.env.PORT ?? 4000),
  temporalAddress: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
  temporalTaskQueue: process.env.TEMPORAL_TASK_QUEUE ?? "audio-analysis",
  maxUploadFileSizeBytes: 50 * 1024 * 1024,
} as const;
