import { Router } from "express";
import { analyzeUploadController } from "../controllers/analysis";
import { uploadAudioMiddleware } from "../services/upload.service";

export const analysisRouter = Router();

analysisRouter.post("/analyze-upload", uploadAudioMiddleware.single("audio"), analyzeUploadController);
