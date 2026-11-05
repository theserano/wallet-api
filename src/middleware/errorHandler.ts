import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors.js";

// Four parameters is how Express knows this is an error handler.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  // Unknown error: log the details for us, send nothing internal to the client.
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
