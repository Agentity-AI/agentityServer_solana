# Agentity Solana Monorepo

Agentity is a Solana-native trust, simulation, payment, and audit platform for autonomous AI agents.

The monorepo now contains:

- `src/` - Express API for auth, agent registry, simulations, payments, task execution, alerts, and Solana proofs.
- `apps/client/` - Vite React client integrated with the live Render backend.
- `programs/agentity_registry/` - optional Anchor registry scaffold for a deeper on-chain demo.
- `db/schema.sql` - PostgreSQL/Supabase schema.
- `test/` - Node test suite for backend utilities and Solana runtime safety.

Live backend:

```text
https://agentityserver-solana.onrender.com
```

Client default API target:

```text
VITE_API_BASE_URL=https://agentityserver-solana.onrender.com
```

## Product Flow

Agentity helps users answer whether an AI agent can be trusted before value moves on-chain.

1. Register an AI agent with a Solana public key.
2. Link the agent wallet and persist Solana metadata.
3. Verify the agent locally and write or simulate a Solana proof memo.
4. Run sandbox simulations before execution.
5. Create transaction policies and guardrails.
6. Pay a task with SOL or an SPL token.
7. Execute the task and store an execution proof.
8. Review dashboard metrics, alerts, transactions, and proof history.

## Stack

- Node.js, Express, Sequelize
- PostgreSQL/Supabase database
- Supabase Auth with JWT bearer tokens and httpOnly cookie support
- Solana Web3.js for devnet/mainnet RPC, memo proofs, SOL payments, and SPL token payments
- React 19, Vite 7, Zustand, Axios, Tailwind CSS 4
- Swagger/OpenAPI at `/docs`
- Docker sandbox service for agent simulation
- Optional AWS KMS signing for execution audit payloads

## Requirements

- Node.js 18+
- npm 10+
- PostgreSQL or Supabase database
- Solana CLI for operator keypair generation if using real proofs/payments
- Docker if running sandbox images locally

## Install

```bash
npm install
```

The root package is an npm workspace. The client lives at `apps/client` and is installed from the root lockfile.

## Environment

Copy the backend environment file:

```bash
cp .env.example .env
```

Required backend variables:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres
DB_SYNC_ON_START=false
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
PUBLIC_API_BASE_URL=http://localhost:5000
```

Solana variables:

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

Optional variables:

```bash
AWS_REGION=
AWS_KMS_KEY_ID=
CRE_WEBHOOK_URL=
SOLANA_PRICE_SOL_EXECUTION=0.050
SOLANA_PRICE_SPL_EXECUTION=5.00
```

Client environment:

```bash
cp apps/client/.env.example apps/client/.env
```

For local API development:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

For deployed frontend integration:

```bash
VITE_API_BASE_URL=https://agentityserver-solana.onrender.com
```

## Development

Run the API:

```bash
npm run dev:api
```

Run the client:

```bash
npm run dev:client
```

Run both in separate terminals. By default, the API uses port `5000` and Vite uses port `5173`.

## Database

Apply the SQL schema:

```bash
npm run db:schema:apply
```

By default, `DB_SYNC_ON_START=false`. For local development only, you may set:

```bash
DB_SYNC_ON_START=true
```

## Solana Operator Setup

Install the Solana CLI, then point it to devnet:

```bash
solana config set --url https://api.devnet.solana.com
```

Create an operator keypair:

```bash
solana-keygen new --outfile ~/.config/solana/agentity-operator.json
solana address --keypair ~/.config/solana/agentity-operator.json
```

Fund it on devnet:

```bash
solana airdrop 2 --keypair ~/.config/solana/agentity-operator.json
solana balance --keypair ~/.config/solana/agentity-operator.json
```

Use either a path:

```bash
SOLANA_OPERATOR_KEYPAIR_PATH=/absolute/path/to/agentity-operator.json
```

or a JSON secret array:

```bash
SOLANA_OPERATOR_KEYPAIR_JSON=[12,34,56,...]
```

Keep `SOLANA_ENABLE_REAL_TRANSFERS=false` until the operator wallet, payment rules, and demo flow have been reviewed.

## API Endpoints

Swagger is the source of truth:

```text
GET /docs
```

Important endpoints:

- `GET /health`
- `GET /system/status`
- `GET /solana/status`
- `GET /solana/transactions/:signature`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /agents/types`
- `POST /agents/register`
- `GET /agents/my`
- `POST /agents/:id/verify`
- `GET /agents/:id/solana-history`
- `POST /wallets/link`
- `GET /simulation/scenarios`
- `POST /simulation/run`
- `GET /simulation/history`
- `POST /tasks/request`
- `POST /tasks/:id/simulate`
- `POST /tasks/:id/pay`
- `POST /tasks/:id/execute`
- `GET /transactions/history`
- `GET /transactions/policies`
- `POST /transactions/policies`
- `GET /alerts`
- `GET /alerts/summary`

## Frontend Integration

The React client uses:

- `VITE_API_BASE_URL` for the API origin.
- Axios with `withCredentials: true`.
- Bearer JWT persistence from `/auth/register` and `/auth/login`.
- Zustand actions for dashboard, agents, wallet linking, verification, simulations, transaction policies, alerts, and Solana status.

The client defaults to the live backend:

```text
https://agentityserver-solana.onrender.com
```

Auth requests return a JWT and also set the `agentity_jwt` httpOnly cookie. The client stores the JWT in `localStorage` and sends it as:

```http
Authorization: Bearer <jwt>
```

## Solana Proof And Payment Modes

`GET /solana/status` and `GET /system/status` report:

- cluster
- RPC URL
- commitment
- operator public key
- operator signing availability
- real proof mode
- real payment mode
- registry program id
- config errors

If an operator keypair is not configured, the backend can still complete the demo with simulated Solana proofs and payments. If Solana env values are malformed, status endpoints return a degraded status payload instead of crashing.

Payment payload:

```json
{
  "currency": "SOL"
}
```

SPL payment payload:

```json
{
  "currency": "CASH-SPL",
  "tokenMint": "TOKEN_MINT_ADDRESS",
  "tokenDecimals": 6
}
```

When `SOLANA_ENABLE_REAL_TRANSFERS` is not `true`, task payment still records a simulated paid state. This is useful for hackathon demos before funding an operator wallet.

## Testing

Backend unit tests:

```bash
npm test
```

Client lint and production build:

```bash
npm run test:client
```

Full test pass:

```bash
npm run test:all
```

Smoke test against a running API:

```bash
npm run smoke
```

Latest verified local commands:

```text
npm test
npm run test:client
```

## Deployment

### Backend

Render should run:

```bash
npm install
npm start
```

Make sure the service binds to `process.env.PORT`, which is already handled by `src/server.js`.

### Frontend

For Vercel, Netlify, or Render static hosting:

```bash
npm install
npm run build --workspace @agentity/client
```

Publish directory:

```text
apps/client/dist
```

Set:

```bash
VITE_API_BASE_URL=https://agentityserver-solana.onrender.com
```

## Hackathon Demo Script

1. Open the deployed frontend.
2. Sign up or log in.
3. Confirm the dashboard shows Solana runtime status.
4. Register an agent with a Solana devnet public key.
5. Verify the agent and show whether the proof is synced or simulated.
6. Run a Token Swap simulation with `USDC -> SOL`.
7. Create a treasury transaction policy.
8. Pay and execute a task if test data is available.
9. Open Transactions and show Solana proof links where signatures exist.
10. Open the live API docs at `/docs`.

## Troubleshooting

If `/health` is healthy but `/solana/status` fails, check Solana env values. The code now reports malformed Solana config in `configErrors` instead of throwing from the status endpoint.

If the frontend shows auth failures:

- Confirm `VITE_API_BASE_URL` is correct.
- Confirm CORS allows the deployed frontend origin.
- Confirm `/auth/login` returns a `jwt`.
- Clear `localStorage.agentity_auth_token` and log in again.

If real proofs do not appear:

- Confirm `SOLANA_ENABLE_REAL_PROOFS=true`.
- Confirm the operator keypair is valid.
- Confirm the operator wallet has devnet SOL.
- Confirm `SOLANA_RPC_URL` is reachable.

If payments are simulated:

- Confirm `SOLANA_ENABLE_REAL_TRANSFERS=true`.
- Confirm the operator wallet is funded.
- Confirm SPL token mint and decimals are provided for SPL payments.

## Security Notes

- Never commit `.env` or Solana keypair files.
- Keep `SOLANA_ENABLE_REAL_TRANSFERS=false` until payment behavior is reviewed.
- Treat all on-chain data and RPC responses as untrusted.
- Validate account owners, payload shapes, and signatures before using Solana data in higher-risk flows.
- Use devnet for demos unless mainnet is explicitly required and funded intentionally.

## Submission Summary

Agentity is the trust and execution layer for autonomous AI agents on Solana. It combines identity, simulation, policy controls, payments, proof records, and monitoring into one workflow that is easy to demo and extend.
