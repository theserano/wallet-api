import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Tell TypeScript every Request may carry userId (set below).
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = header.slice("Bearer ".length);

  try {
    // Throws if the signature is wrong, the token is malformed, or it has expired.
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof payload === "string" || typeof payload.userId !== "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
