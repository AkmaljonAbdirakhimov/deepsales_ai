import type { Request, Response } from "express";
import { describeWorkflow } from "../../temporal";
import {
  getWorkflowIdFromParams,
  sendInternalError,
  sendWorkflowLookupError,
} from "../../utils/controller.utils";

export async function workflowStatusController(req: Request, res: Response): Promise<Response> {
  try {
    const workflowId = getWorkflowIdFromParams(req.params.id);
    if (!workflowId) {
      return res.status(400).json({ error: "Invalid workflow id." });
    }

    const description = await describeWorkflow(workflowId);
    return res.json({
      workflowId,
      status: description.status.name,
      startTime: description.startTime,
      closeTime: description.closeTime,
    });
  } catch (error) {
    if (error instanceof Error) {
      return sendWorkflowLookupError(
        res,
        error,
        500,
        "Failed to fetch workflow status.",
      );
    }
    return sendInternalError(res, "Failed to fetch workflow status.", error);
  }
}
