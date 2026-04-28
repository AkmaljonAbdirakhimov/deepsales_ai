import { useEffect, useMemo, useState } from "react";
import {
  fetchWorkflowResult,
  fetchWorkflowStatus,
  startAudioAnalysis,
} from "../api/analysis.api";
import { WorkflowStatus, type AnalysisResult } from "../types/workflow";

const POLL_INTERVAL_MS = 2500;

export function useAudioAnalysis() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const statusVariant = useMemo(() => {
    switch (status) {
      case WorkflowStatus.COMPLETED:
        return "success";
      case WorkflowStatus.FAILED:
      case WorkflowStatus.TERMINATED:
      case WorkflowStatus.TIMED_OUT:
        return "danger";
      case WorkflowStatus.RUNNING:
        return "warning";
      default:
        return "secondary";
    }
  }, [status]);

  async function submitAudio(): Promise<void> {
    if (!audioFile) {
      setErrorMessage("Please select an audio file first.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setWorkflowId(null);
    setStatus(null);
    setResult(null);

    try {
      const newWorkflowId = await startAudioAnalysis(audioFile);
      setWorkflowId(newWorkflowId);
      setStatus(WorkflowStatus.RUNNING);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unexpected upload error.");
    } finally {
      setIsUploading(false);
    }
  }

  useEffect(() => {
    if (!workflowId) {
      return;
    }

    let isCancelled = false;
    const interval = setInterval(async () => {
      try {
        const workflowStatus = await fetchWorkflowStatus(workflowId);
        if (isCancelled) {
          return;
        }

        setStatus(workflowStatus.status);

        if (workflowStatus.status === WorkflowStatus.COMPLETED) {
          clearInterval(interval);
          const workflowResult = await fetchWorkflowResult(workflowId);
          if (!isCancelled) {
            setResult(workflowResult);
          }
        }

        if (
          workflowStatus.status === WorkflowStatus.FAILED ||
          workflowStatus.status === WorkflowStatus.CANCELED ||
          workflowStatus.status === WorkflowStatus.TERMINATED ||
          workflowStatus.status === WorkflowStatus.TIMED_OUT
        ) {
          clearInterval(interval);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Polling failed.");
        }
        clearInterval(interval);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [workflowId]);

  return {
    audioFile,
    workflowId,
    status,
    result,
    isUploading,
    errorMessage,
    statusVariant,
    setAudioFile,
    submitAudio,
  };
}
