export interface AnalysisMetrics {
  scriptAdherenceScore: number | null;
  talkRatio: number | null;
  objectionHandlingScore: number | null;
  mistakesCount: number | null;
  sentimentScore: number | null;
  leadQualityScore: number | null;
}

export interface AnalysisResult {
  transcript: string;
  category: string | null;
  metrics: AnalysisMetrics;
  summary: string | null;
}
