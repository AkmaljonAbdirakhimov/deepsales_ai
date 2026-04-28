export interface AnalysisMetrics {
  scriptAdherenceScore: number;
  talkRatio: number;
  objectionHandlingScore: number;
  mistakesCount: number;
  sentimentScore: number;
  leadQualityScore: number;
}

export interface AnalysisResult {
  transcript: string;
  category: string;
  metrics: AnalysisMetrics;
  summary: string;
}
