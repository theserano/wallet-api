import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { createAccount, deposit, getBalance, getOwnedAccount } from "../services/account.service.js";

const router: Router = Router();

// Every route in this file needs a logged-in user.
router.use(requireAuth);

// Postgres throws on a malformed UUID, so check it before querying.
const accountParamsSchema = z.object({ id: z.uuid() });

// Amounts are whole kobo: 5000 = ₦50. No decimals, no zero, no negatives.
const amountBodySchema = z.object({ amount: z.number().int().positive() });

router.post("/", async (req, res) => {
  const account = await createAccount(req.userId!);
  res.status(201).json(account);
});

router.get("/:id/balance", async (req, res) => {
  const parsed = accountParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: z.flattenError(parsed.error) });
  }

  const account = await getOwnedAccount(parsed.data.id, req.userId!);
  const balance = await getBalance(account.id);
  // JSON can't hold a BigInt, so send it as a string.
  res.json({ accountId: account.id, currency: account.currency, balance: balance.toString() });
});

router.post("/:id/deposit", async (req, res) => {
  const params = accountParamsSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: z.flattenError(params.error) });
  }
  const body = amountBodySchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: z.flattenError(body.error) });
  }

  const result = await deposit(params.data.id, req.userId!, body.data.amount);
  res.json({ transactionId: result.transactionId, balance: result.balance.toString() });
});

export default router;
