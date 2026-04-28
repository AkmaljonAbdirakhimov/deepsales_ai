import type { Request, Response } from "express";
import { getWorkflowResult } from "../../temporal";
import { getWorkflowIdFromParams, sendWorkflowLookupError } from "../../utils/controller.utils";

export async function workflowResultController(req: Request, res: Response): Promise<Response> {
  try {
    const workflowId = getWorkflowIdFromParams(req.params.id);
    if (!workflowId) {
      return res.status(400).json({ error: "Invalid workflow id." });
    }

    const result = await getWorkflowResult(workflowId);
    return res.json({ workflowId, result });
  } catch (error) {
    return sendWorkflowLookupError(
      res,
      error,
      409,
      "Workflow is not completed yet or failed.",
    );
  }
}
