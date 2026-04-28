import { Router } from "express";
import { workflowResultController, workflowStatusController } from "../controllers/workflow";

export const workflowRouter = Router();

workflowRouter.get("/workflows/:id/status", workflowStatusController);
workflowRouter.get("/workflows/:id/result", workflowResultController);
