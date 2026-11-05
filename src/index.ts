import "dotenv/config";
import express from "express";
import { pool } from "./db.js";


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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Wallet API running on port ${PORT}`);
});