# Agentity Solana Backend

Agentity is the trust, simulation, payment, and audit backend for autonomous AI agents on Solana.

It gives every agent a verifiable identity, wallet, trust score, simulation history, payment trail, execution proof, and dashboard-ready audit log. The core demo flow is:

1. Register an agent with a Solana public key.
2. Verify the agent and write a Solana proof memo.
3. Simulate a risky action before execution.
4. Pay the agent with SOL or an SPL token.
5. Execute the task and write an execution proof to Solana.
6. Inspect the dashboard, payments, transactions, alerts, and proof history.

## Stack

- Node.js, Express, Sequelize, PostgreSQL/Supabase
- Supabase Auth for user sessions
- Solana Web3.js for devnet/mainnet RPC, memo proofs, SOL transfers
- SPL Token support for token payments such as USDC-SPL or CASH-SPL
- Swagger/OpenAPI at `/docs`
- Docker sandbox simulation service
- Optional AWS KMS signing for execution audit payloads

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

If you do not have an `.env.example` yet, create `.env` with the variables in the next section.

## Environment

Required:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres
DB_SYNC_ON_START=false
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
PUBLIC_API_BASE_URL=http://localhost:5000
```

By default the API starts without running `sequelize.sync()`. Apply the schema separately with:

```bash
npm run db:schema:apply
```

For local development only, set `DB_SYNC_ON_START=true` if you want Sequelize to sync models during startup.

Solana:

```bash
SOLANA_CLUSTER=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_COMMITMENT=confirmed
SOLANA_OPERATOR_PUBLIC_KEY=YOUR_OPERATOR_PUBLIC_KEY
SOLANA_OPERATOR_KEYPAIR_JSON=[1,2,3,...]
SOLANA_ENABLE_REAL_PROOFS=true
SOLANA_ENABLE_REAL_TRANSFERS=false
SOLANA_REGISTRY_PROGRAM_ID=
```

Optional:

```bash
AWS_REGION=
AWS_KMS_KEY_ID=
CRE_WEBHOOK_URL=
SOLANA_PRICE_SOL_EXECUTION=0.050
SOLANA_PRICE_SPL_EXECUTION=5.00
```

`SOLANA_ENABLE_REAL_PROOFS=true` writes memo transactions when an operator keypair is configured. `SOLANA_ENABLE_REAL_TRANSFERS=true` sends real SOL/SPL payments from the operator wallet, so only enable it after funding the operator wallet on the target cluster.

## Getting Solana Keys

1. Install the Solana CLI from https://docs.solana.com/cli/install-solana-cli-tools.
2. Point it to devnet:

```bash
solana config set --url https://api.devnet.solana.com
```

3. Create an operator keypair:

```bash
solana-keygen new --outfile ~/.config/solana/agentity-operator.json
solana address --keypair ~/.config/solana/agentity-operator.json
```

4. Fund the operator on devnet:

```bash
solana airdrop 2 --keypair ~/.config/solana/agentity-operator.json
solana balance --keypair ~/.config/solana/agentity-operator.json
```

5. Put the keypair into `.env` using one of these approaches:

```bash
SOLANA_OPERATOR_KEYPAIR_PATH=/absolute/path/to/agentity-operator.json
```

or paste the JSON array:

```bash
SOLANA_OPERATOR_KEYPAIR_JSON=[12,34,56,...]
```

For production, use a secured secret manager and keep `SOLANA_ENABLE_REAL_TRANSFERS=false` until the payment flow has been reviewed.

## API Surface

Swagger is the source of truth:

```text
GET /docs
```

Important endpoints:

- `POST /auth/register`, `POST /auth/login`
- `POST /agents/register`
- `POST /agents/:id/verify`
- `GET /agents/:id/solana-history`
- `POST /wallets/link`
- `POST /simulation/run`
- `POST /tasks/request`
- `POST /tasks/:id/simulate`
- `POST /tasks/:id/pay`
- `POST /tasks/:id/execute`
- `GET /payments/history`
- `GET /transactions/history`
- `GET /dashboard/overview`
- `GET /solana/status`
- `GET /solana/transactions/:signature`

## Solana Payment Behavior

`POST /tasks/:id/pay` accepts:

```json
{
  "currency": "SOL"
}
```

or SPL token metadata:

```json
{
  "currency": "CASH-SPL",
  "tokenMint": "TOKEN_MINT_ADDRESS",
  "tokenDecimals": 6
}
```

When `SOLANA_ENABLE_REAL_TRANSFERS` is not `true`, the backend still creates a paid record with `simulated: true`. This keeps demos and frontend integration smooth before the operator wallet is funded.

## Solana Proof Model

Agentity writes compact memo proofs to Solana:

- `AGENT_REGISTERED`
- `VERIFIED`
- `AGENT_FLAGGED`
- `TASK_EXECUTED`

The full payload is stored in Postgres, while the memo stores a deterministic hash:

```text
AGENTITY:VERIFIED:<agentId>:<sha256-proof-hash>
```

This makes proof lookup fast for the frontend and keeps on-chain data small.

## Optional Anchor Program

The backend is already useful with memo proofs. The `programs/agentity_registry` scaffold adds the Solana-native account model for a deeper hackathon demo:

- `AgentProfile`
- `CapabilityPolicy`
- `AgentActionLog`
- `AgentReputation`

Use it when you want to deploy a registry program and set `SOLANA_REGISTRY_PROGRAM_ID`.

## Test

```bash
npm test
```

Smoke test against a running API:

```bash
npm run smoke
```

## Submission Story

Agentity is the trust and execution layer for autonomous AI agents on Solana. It helps users answer:

- Can I trust this agent?
- What is it allowed to do?
- What happened before money moved?
- Was the agent paid?
- Can I audit the result later?

That story maps directly to Solana performance: fast verification, fast payment, fast proof lookup, and composable APIs for any Solana app that wants to use trusted agents.
