import { useEffect, useMemo, useState } from "react";
import {
  fetchWorkflowResult,
  fetchWorkflowStatus,
  startAudioAnalysis,
} from "../api/analysis.api";
import type { AnalysisResult, WorkflowStatus } from "../types/workflow";

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
      case "STATUS_COMPLETED":
        return "success";
      case "STATUS_FAILED":
      case "STATUS_TERMINATED":
      case "STATUS_TIMED_OUT":
        return "danger";
      case "STATUS_RUNNING":
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
      setStatus("STATUS_RUNNING");
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

        if (workflowStatus.status === "STATUS_COMPLETED") {
          clearInterval(interval);
          const workflowResult = await fetchWorkflowResult(workflowId);
          if (!isCancelled) {
            setResult(workflowResult);
          }
        }

        if (
          workflowStatus.status === "STATUS_FAILED" ||
          workflowStatus.status === "STATUS_CANCELED" ||
          workflowStatus.status === "STATUS_TERMINATED" ||
          workflowStatus.status === "STATUS_TIMED_OUT"
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
