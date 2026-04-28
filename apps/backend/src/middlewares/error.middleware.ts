import type { NextFunction, Request, Response } from "express";

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found." });
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  res.status(500).json({
    error: "Unexpected server error.",
    details: error instanceof Error ? error.message : "Unknown error",
  });
}
