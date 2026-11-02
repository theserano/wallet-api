# Wallet API

A backend for a simple digital wallet, built to get the money-handling parts right:

- **Double-entry ledger:** balances are derived from immutable ledger entries, never stored in a mutable `balance` column.
- **Safe concurrency:** withdrawals and transfers lock account rows (`SELECT ... FOR UPDATE`, in a fixed order) so parallel requests can't overspend or deadlock. A test fires 50 simultaneous transfers and checks the final balances.
- **Idempotency keys:** retrying a deposit, withdrawal or transfer with the same `Idempotency-Key` never moves money twice.
- **Money as integers:** all amounts are stored in kobo (`BIGINT`), never floats.
- **Auth and validation:** JWT authentication, bcrypt password hashing, zod request validation, and per-user account ownership checks.

**Stack:** Node.js, TypeScript, Express, PostgreSQL (`pg`, no ORM), zod, JWT.