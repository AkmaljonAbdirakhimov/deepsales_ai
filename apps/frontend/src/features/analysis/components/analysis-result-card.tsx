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
        <CardDescription>Mock response from current Temporal activities.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Metric label="Category" value={result.category} />
        <Metric label="Script Adherence" value={String(result.metrics.scriptAdherenceScore)} />
        <Metric label="Talk Ratio" value={String(result.metrics.talkRatio)} />
        <Metric label="Objection Handling" value={String(result.metrics.objectionHandlingScore)} />
        <Metric label="Mistakes Count" value={String(result.metrics.mistakesCount)} />
        <Metric label="Sentiment Score" value={String(result.metrics.sentimentScore)} />
        <Metric label="Lead Quality Score" value={String(result.metrics.leadQualityScore)} />
        <Metric label="Summary" value={result.summary} className="md:col-span-2" />
        <Metric label="Transcript" value={result.transcript} className="md:col-span-2" />
      </CardContent>
    </Card>
  );
}
