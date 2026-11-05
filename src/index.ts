import "dotenv/config";
import express from "express";
import { pool } from "./db.js";
import authRouter from "./routes/auth.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { errorHandler } from "./middleware/errorHandler.js";


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

// temporary endpoint to check the token works; delete later
app.get("/me", requireAuth, (req, res) => {
  res.json({ userId: req.userId });
});

app.use("/auth", authRouter);

// Must be registered last, after all routes.
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Wallet API running on port ${PORT}`);
});