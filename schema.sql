CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  currency TEXT NOT NULL DEFAULT 'NGN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- This is the important one. No `balance` column anywhere.
-- Every movement of money is a row here. Balance = SUM(amount) for an account.
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  amount BIGINT NOT NULL, -- store as kobo/cents (integer), never floats for money
  transaction_id UUID NOT NULL, -- groups the debit+credit pair together
  type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ledger_account_id ON ledger_entries(account_id);
CREATE INDEX idx_ledger_transaction_id ON ledger_entries(transaction_id);

CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY,
  response_body JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);