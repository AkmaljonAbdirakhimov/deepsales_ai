import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import type { AnalysisResult } from "../types/workflow";
import { Metric } from "./metric";

interface AnalysisResultCardProps {
  result: AnalysisResult;
}

export function AnalysisResultCard({ result }: AnalysisResultCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Result</CardTitle>
        <CardDescription>Real Gemini output (missing fields show as "No data").</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Metric label="Category" value={result.category} />
        <Metric label="Script Adherence" value={result.metrics.scriptAdherenceScore} />
        <Metric label="Talk Ratio" value={result.metrics.talkRatio} />
        <Metric label="Objection Handling" value={result.metrics.objectionHandlingScore} />
        <Metric label="Mistakes Count" value={result.metrics.mistakesCount} />
        <Metric label="Sentiment Score" value={result.metrics.sentimentScore} />
        <Metric label="Lead Quality Score" value={result.metrics.leadQualityScore} />
        <Metric label="Summary" value={result.summary} className="md:col-span-2" />
        <Metric label="Transcript" value={result.transcript} className="md:col-span-2" />
      </CardContent>
    </Card>
  );
}
