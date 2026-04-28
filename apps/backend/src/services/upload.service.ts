import path from "node:path";
import fs from "node:fs/promises";
import multer from "multer";
import { env } from "../config/env";

const uploadsDir = path.resolve(process.cwd(), "tmp", "uploads");

export const uploadAudioMiddleware = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      try {
        await fs.mkdir(uploadsDir, { recursive: true });
        cb(null, uploadsDir);
      } catch (error) {
        cb(error as Error, uploadsDir);
      }
    },
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, "-");
      cb(null, `${Date.now()}-${safeName}`);
    },
  }),
  limits: {
    fileSize: env.maxUploadFileSizeBytes,
  },
});
