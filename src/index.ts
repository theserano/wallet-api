import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { pool } from "./db.js";
import { AppError } from "./errors.js";
import authRouter from "./routes/auth.js";


const app = express();
app.use(express.json());

// temporary endpoint to check if postgresql db is okay

app.get('/db-check', async (_req, res) => {
  try{
    const result = await pool.query('SELECT now()');
    res.json({ status: "ok", dbTime: result.rows[0].now });
  } catch (error) {
    console.error("Database check failed:", error);
    res.status(500).json({ status: "error", message: "Failed to check database" });
  }
});

app.use("/auth", authRouter);

// Temporary error handler; moves to middleware/errorHandler.ts in step 3.
// Must be registered after all routes.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Wallet API running on port ${PORT}`);
});