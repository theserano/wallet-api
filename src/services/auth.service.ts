import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { AppError } from "../errors.js";

function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "1h" });
}

export async function register(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash],
    );
    const user = result.rows[0];
    return { user, token: signToken(user.id) };
  } catch (err: any) {
    if (err.code === "23505") {
      throw new AppError(409, "Email already registered");
    }
    throw err;
  }
}

export async function login(email: string, password: string) {
  const result = await pool.query(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email],
  );
  const row = result.rows[0];

  // Same status and message for both cases, so nobody can probe which emails exist.
  if (!row) {
    throw new AppError(401, "Invalid credentials");
  }
  const passwordOk = await bcrypt.compare(password, row.password_hash);
  if (!passwordOk) {
    throw new AppError(401, "Invalid credentials");
  }

  const user = { id: row.id, email: row.email };
  return { user, token: signToken(user.id) };
}
