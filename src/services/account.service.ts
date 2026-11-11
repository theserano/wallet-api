import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { pool } from "../db.js";
import { AppError } from "../errors.js";

export async function createAccount(userId: string) {
  const result = await pool.query(
    "INSERT INTO accounts (user_id) VALUES ($1) RETURNING id, currency",
    [userId],
  );
  return result.rows[0];
}

// Finds an account only if it belongs to this user.
// 404 (not 403) so nobody learns that someone else's account exists.
export async function getOwnedAccount(accountId: string, userId: string) {
  const result = await pool.query(
    "SELECT id, currency FROM accounts WHERE id = $1 AND user_id = $2",
    [accountId, userId],
  );
  if (result.rows.length === 0) {
    throw new AppError(404, "Account not found");
  }
  return result.rows[0];
}

// Balance is never stored; it is the sum of the ledger.
// Takes a pool or a client, so steps 6-7 can run it inside their transaction.
export async function getBalance(accountId: string, db: Pool | PoolClient = pool): Promise<bigint> {
  const result = await db.query(
    `SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) AS balance
     FROM ledger_entries
     WHERE account_id = $1`,
    [accountId],
  );
  // pg returns SUM over BIGINT as a string, e.g. "5000"
  return BigInt(result.rows[0].balance);
}

export async function deposit(accountId: string, userId: string, amount: number) {
  await getOwnedAccount(accountId, userId);

  // One client for the whole transaction: BEGIN, queries and COMMIT
  // must all run on the same connection.
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const transactionId = randomUUID();
    await client.query(
      `INSERT INTO ledger_entries (account_id, amount, transaction_id, type)
       VALUES ($1, $2, $3, 'credit')`,
      [accountId, amount, transactionId],
    );
    const balance = await getBalance(accountId, client);

    await client.query("COMMIT");
    return { transactionId, balance };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    // Always give the connection back, success or failure.
    client.release();
  }
}
