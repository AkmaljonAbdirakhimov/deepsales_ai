import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import type { WorkflowStatus } from "../types/workflow";

interface AnalysisUploadCardProps {
  isUploading: boolean;
  status: WorkflowStatus | null;
  statusVariant: "default" | "secondary" | "success" | "warning" | "danger";
  workflowId: string | null;
  errorMessage: string | null;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
}

export function AnalysisUploadCard({
  isUploading,
  status,
  statusVariant,
  workflowId,
  errorMessage,
  onFileChange,
  onSubmit,
}: AnalysisUploadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>DeepSales Audio Analysis MVP</CardTitle>
        <CardDescription>
          Upload call audio, trigger Temporal workflow, and inspect structured analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          type="file"
          accept="audio/*"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        <div className="flex items-center gap-3">
          <Button onClick={onSubmit} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Start Analysis"}
          </Button>
          {status ? <Badge variant={statusVariant}>{status}</Badge> : null}
        </div>
        {workflowId ? <p className="text-sm text-zinc-600">Workflow ID: {workflowId}</p> : null}
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      </CardContent>
    </Card>
  );
}
