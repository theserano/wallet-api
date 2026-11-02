import express from "express";
import "dotenv/config";


const app = express();
app.use(express.json());

// temporary endpoint to check if postgresql db is okay

app.get('/db-check', async (_req, res) => {
  try{
    const { pool } = await import('./db.ts');
    const client = await pool.connect();
    const result = await client.query('SELECT now()');
    client.release();
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