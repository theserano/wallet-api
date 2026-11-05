import { Router } from "express";
import { z } from "zod";
import { login, register } from "../services/auth.service.js";

const router: Router = Router();

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

router.post("/register", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: z.flattenError(parsed.error) });
  }

  const result = await register(parsed.data.email, parsed.data.password);
  res.status(201).json(result);
});

router.post("/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: z.flattenError(parsed.error) });
  }

  const result = await login(parsed.data.email, parsed.data.password);
  res.json(result);
});

export default router;
