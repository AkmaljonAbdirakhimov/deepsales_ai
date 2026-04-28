import type { Response } from "express";
import { WorkflowNotFoundError } from "@temporalio/client";

export function getWorkflowIdFromParams(idParam: string | string[] | undefined): string | undefined {
  if (typeof idParam === "string") {
    return idParam;
  }
  return undefined;
}

export function sendInternalError(
  res: Response,
  message: string,
  error: unknown,
): Response {
  return res.status(500).json({
    error: message,
    details: error instanceof Error ? error.message : "Unknown error",
  });
}

export function sendWorkflowLookupError(
  res: Response,
  error: unknown,
  pendingStatusCode: number,
  pendingMessage: string,
): Response {
  if (error instanceof WorkflowNotFoundError) {
    return res.status(404).json({ error: "Workflow not found." });
  }

  return res.status(pendingStatusCode).json({
    error: pendingMessage,
    details: error instanceof Error ? error.message : "Unknown error",
  });
}
