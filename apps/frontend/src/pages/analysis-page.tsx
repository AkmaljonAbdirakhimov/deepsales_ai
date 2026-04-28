import { AnalysisResultCard } from "../features/analysis/components/analysis-result-card";
import { AnalysisUploadCard } from "../features/analysis/components/analysis-upload-card";
import { useAudioAnalysis } from "../features/analysis/hooks/use-audio-analysis";

export function AnalysisPage() {
  const {
    result,
    status,
    workflowId,
    isUploading,
    errorMessage,
    statusVariant,
    setAudioFile,
    submitAudio,
  } = useAudioAnalysis();

  return (
    <main className="page-shell">
      <AnalysisUploadCard
        isUploading={isUploading}
        status={status}
        statusVariant={statusVariant}
        workflowId={workflowId}
        errorMessage={errorMessage}
        onFileChange={setAudioFile}
        onSubmit={submitAudio}
      />

      {result ? <AnalysisResultCard result={result} /> : null}
    </main>
  );
}
