# Solana Integration Setup

This guide covers the keys and environment values needed to run Agentity on Solana devnet.

## 1. Operator Wallet

The operator wallet pays proof transaction fees and, when enabled, sends task payments.

```bash
solana config set --url https://api.devnet.solana.com
solana-keygen new --outfile ~/.config/solana/agentity-operator.json
solana address --keypair ~/.config/solana/agentity-operator.json
solana airdrop 2 --keypair ~/.config/solana/agentity-operator.json
```

Set one of:

```bash
SOLANA_OPERATOR_KEYPAIR_PATH=/absolute/path/to/agentity-operator.json
```

or:

```bash
SOLANA_OPERATOR_KEYPAIR_JSON=[12,34,56,...]
```

Also set:

```bash
SOLANA_OPERATOR_PUBLIC_KEY=<output of solana address>
```

## 2. RPC

For devnet:

```bash
SOLANA_CLUSTER=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
```

For production, use a dedicated RPC provider and rotate keys through your deployment platform.

## 3. Proofs

Proofs are enabled by default when a keypair is configured:

```bash
SOLANA_ENABLE_REAL_PROOFS=true
```

If disabled or missing a keypair, the API still returns proof hashes with `simulated: true`.

## 4. Payments

Keep payment transfers simulated until the demo wallet is funded:

```bash
SOLANA_ENABLE_REAL_TRANSFERS=false
```

To send real SOL/SPL transfers:

```bash
SOLANA_ENABLE_REAL_TRANSFERS=true
```

The operator wallet must hold enough SOL for fees and SOL payments. For SPL payments, the operator wallet must also hold the SPL token and have or create associated token accounts.

## 5. SPL Token Payments

Use `POST /tasks/:id/pay` with:

```json
{
  "currency": "CASH-SPL",
  "tokenMint": "TOKEN_MINT_ADDRESS",
  "tokenDecimals": 6
}
```

If the hackathon provides a final CASH-SPL mint, put that mint in the frontend payment request or configure the frontend default.

## 6. Supabase

Create a Supabase project and copy:

```bash
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`DATABASE_URL` should be the direct Postgres connection string. The backend runs Sequelize sync on boot.

## 7. Swagger

Run the backend and open:

```text
http://localhost:5000/docs
```

Use Swagger to verify:

1. `POST /auth/register`
2. `POST /agents/register`
3. `POST /wallets/link`
4. `POST /agents/{id}/verify`
5. `GET /agents/{id}/solana-history`
6. `POST /tasks/request`
7. `POST /tasks/{id}/simulate`
8. `POST /tasks/{id}/pay`
9. `POST /tasks/{id}/execute`
10. `GET /solana/transactions/{signature}`
