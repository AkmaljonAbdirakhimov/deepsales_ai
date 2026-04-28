import type { Request, Response } from "express";
import { startAudioAnalysisWorkflow } from "../../temporal";
import { sendInternalError } from "../../utils/controller.utils";

export async function analyzeUploadController(req: Request, res: Response): Promise<Response> {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Missing audio file in `audio` field." });
    }

    const workflowId = await startAudioAnalysisWorkflow(req.file.path);
    return res.status(202).json({ workflowId });
  } catch (error) {
    return sendInternalError(res, "Failed to start analysis workflow.", error);
  }
}
