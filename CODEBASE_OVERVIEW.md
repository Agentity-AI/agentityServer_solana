# Agentity Solana Codebase Overview

## Architecture Summary

Agentity is a **Solana-native trust and execution platform** for autonomous AI agents. It combines three core workflows:
1. **Agent Trust & Identity** — Register, verify, and score AI agents on Solana
2. **Task Simulation & Payment** — Sandbox test, quote, and execute agent tasks with SOL/SPL
3. **Audit & Monitoring** — Record execution proofs, track alerts, and review transaction history

---

## Key Components

### 1. **Core Stack**
- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL/Supabase + Sequelize ORM
- **Auth**: Supabase Auth (JWT + httpOnly cookie)
- **Blockchain**: Solana Web3.js (devnet/mainnet RPC)
- **Frontend**: React 19 + Vite + Zustand + Tailwind CSS 4

### 2. **Backend Entry Points**

#### `src/server.js`
- Loads `.env` configuration
- Initializes Express app and database
- Connects to PostgreSQL on startup
- Listens on `PORT` (default: 5000)

#### `src/app.js`
- Configures middleware: CORS, JSON parser, cookie parser
- Registers 17 route groups via `src/routes/index.js`
- Health check at `GET /health`
- Optional auth middleware (JWT or cookie)
- Request logging via Morgan + Winston
- Global error handler (500 responses)

#### `src/routes/index.js`
- Centralized route registry
- Maps path → lazy-loaded route modules
- Lazy loading prevents circular deps and improves startup time

### 3. **Request Lifecycle**

```
Request
  ↓
CORS + JSON parser + cookie parser
  ↓
Health check (if /health)
  ↓
Optional auth middleware (JWT or httpOnly cookie)
  ↓
Request logger (timestamps, duration, userId)
  ↓
Route handler (auth.js, agents.js, solana.js, etc.)
  ↓
Response or error handler
  ↓
Error logger + 500 response
```

---

## Data Models (Sequelize)

### Core Models
```
Agent (main entity)
  ├── AgentMetadata (1:1) — model name, version, env
  ├── AgentReputation (1:1) — score, risk level
  ├── AgentWallet (1:1) — Solana address, network
  ├── AgentSolanaRegistry (1:1) — on-chain proofs, status
  ├── AgentSolanaProof (1:N) — proof history
  ├── SimulationRun (1:N) — sandbox tests
  ├── TaskExecution (1:N) — task requests + state
  ├── Alert (1:N) — anomalies, warnings
  └── TransactionRecord (1:N) — execution history

TaskExecution
  └── PaymentRecord (1:1) — SOL/SPL amounts + signature

TransactionPolicy — Guardrails
  ├── maxTransactionAmount
  ├── dailyLimit
  └── requireManualApproval

Audit Models
  ├── SmartContractAudit — contract review records
  ├── KmsAuditLog — AWS KMS signing audit trail
  └── UserAgentEvent — user action log
```

---

## API Routes & Workflows

### **Authentication** (`/auth`)
- `POST /auth/register` — Sign up user, set JWT + cookie, return dashboard
- `POST /auth/login` — Log in user, set JWT + cookie
- `POST /auth/logout` — Clear JWT + cookie

**Response**: `{ success, email, name, jwt, dashboard }`

### **Agent Registry** (`/agents`)
- `GET /agents/types` — List agent types (Governance, DeFi, NFT, Trading Bot, etc.)
- `POST /agents/register` — Create new agent with Solana public key
  - Requires: `agentName`, `publicKey`, optional: `description`, `apiEndpoint`, `metadata`
  - Returns: agent ID, fingerprint, initial reputation score
- `GET /agents/my` — List agents for authenticated user
- `GET /agents/:id` — Get agent details with wallet, reputation, Solana registry
- `POST /agents/:id/verify` — Trigger verification (creates Solana proof)
- `GET /agents/:id/solana-history` — Get agent's proof history with links

**Key**: Agents are immutable by public key. Fingerprint = SHA256(publicKey + timestamp).

### **Wallet Linking** (`/wallets`)
- `POST /wallets/link` — Link Solana address to agent
  - Required: `agentId`, `solanaAddress`
  - Optional: `network` (devnet/mainnet), `kmsKeyId`
  - Creates/updates AgentWallet record

**State**: `linked | pending | verified`

### **Task Lifecycle** (`/tasks`)

**1. Request Task** — `POST /tasks/request`
```
{
  "agentId": "uuid",
  "taskType": "execution",
  "inputPayload": { "target": "swap", "network": "solana-devnet", "maxSlippageBps": 100 }
}
```
→ Creates TaskExecution with `status: "created"`, returns task ID

**2. Simulate Task** — `POST /tasks/:id/simulate`
```
{ "scenario": "Token Swap", "inputPayload": { /* custom params */ } }
```
→ Runs in Docker sandbox, returns: `simulationStatus, outputPayload, executionTime, alerts`

**3. Pay Task** — `POST /tasks/:id/pay`
```
{ "currency": "SOL" }
or
{ "currency": "CASH-SPL", "tokenMint": "address", "tokenDecimals": 6 }
```
→ Creates PaymentRecord, executes Solana transfer (if enabled), sets `paymentStatus: "paid"`

**4. Execute Task** — `POST /tasks/:id/execute`
```
{ "executeWithCRE": false }
```
→ Runs agent logic, records proof, creates TransactionRecord, updates task `status: "completed"`

### **Simulation** (`/simulation`)
- `GET /simulation/scenarios` — Get available test scenarios
- `POST /simulation/run` — Test agent without payment (returns metrics)
- `GET /simulation/history` — User's simulation records

**Scenarios**: Token Swap, Liquidity Pool, NFT Mint, Contract Deployment, Multi-Sig, Cross-Chain Bridge

### **Payments** (`/payments`)
- `GET /payments/pricing` — Preview task cost (e.g., 0.050 SOL for execution)
- `GET /payments/history` — User's payment records with Solana signatures

**Pricing** (configurable):
- SOL Simulation: 0.010
- SOL Execution: 0.050
- SPL Execution: 5.00

### **Transactions** (`/transactions`)
- `GET /transactions/history` — User's transaction records + totals
  - Returns: `total, totalVolume, highRisk, items[]`
- `GET /transactions/policies` — User's active policies
- `POST /transactions/policies` — Create new policy
  ```
  {
    "name": "Treasury Policy",
    "description": "...",
    "rules": {
      "maxTransactionAmount": 1000,
      "dailyLimit": 5000,
      "autoRejectHighRisk": true
    }
  }
  ```

### **Alerts** (`/alerts`)
- `GET /alerts` — User's alerts (warnings, anomalies)
- `GET /alerts/summary` — Count by severity
- Auto-generated on: high slippage, risky agents, policy violations

### **Audits** (`/audits`)
- `POST /audits/review` — Submit smart contract for review
- `GET /audits/history` — User's audit records
- Records contract address, risk assessment, timestamp

### **Solana Network** (`/solana`)
- `GET /solana/status` — Runtime config (cluster, RPC, commitment, operator, real proofs enabled)
- `GET /solana/transactions/:signature` — Look up proof + on-chain tx details

### **System** (`/system`)
- `GET /system/status` — Overall system health + database status
- `GET /health` — Database connection check

### **Dashboard** (`/dashboard`)
- `GET /dashboard` — Aggregate user stats (agents, tasks, payments, alerts)

---

## Service Layer

### `services/solana/`
- **client.js** — Solana connection, RPC calls, cluster config
- **registryService.js** — Register agents, create proofs, verify on-chain
- **walletService.js** — Link/unlink wallet addresses
- **paymentService.js** — Quote prices, execute transfers, track payments

### `services/sandbox/`
- **sandboxService.js** — Coordinate Docker container for task simulation
- **dockerRunner.js** — Shell out to Docker CLI

### `services/audit/`
- **logEvent.js** — Append-only user action log
- **userAgentAudit.js** — Track agent interactions
- **contractAuditService.js** — Review smart contracts

### `services/alerts/`
- **alertService.js** — Create/retrieve alerts
- **alertUtils.js** — Alert templates (slippage, high risk, etc.)

### `services/transactions/`
- **transactionService.js** — Record payments, policies, tx history

### `services/aws/`
- **kmsService.js** — Sign execution payloads with AWS KMS

### `services/cre/`
- **creService.js** — CRE (Collaborative Runtime Execution) webhook integration

---

## Authentication & Authorization

### Supabase Auth Flow
1. User signs up: `POST /auth/register` → Creates Supabase user + JWT
2. JWT stored in `localStorage` (frontend) and `agentity_jwt` httpOnly cookie (backend)
3. Requests send: `Authorization: Bearer <jwt>` header or cookie
4. Middleware validates JWT, attaches `req.user` (email, id, etc.)

### Authorization Model
- **Unauthenticated routes**: `/health`, `/docs`, `/solana/status`, `/auth/register`, `/auth/login`
- **Authenticated routes**: Everything else requires valid JWT
- **Ownership check**: Users can only access their own agents, tasks, transactions

---

## Configuration

### Environment Variables

**Database**
```
DATABASE_URL=postgresql://user:pass@host:5432/db
DB_SYNC_ON_START=false
```

**Supabase Auth**
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Solana Network**
```
SOLANA_CLUSTER=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_COMMITMENT=confirmed
SOLANA_OPERATOR_PUBLIC_KEY=...
SOLANA_OPERATOR_KEYPAIR_JSON=[1,2,3,...]
SOLANA_ENABLE_REAL_PROOFS=true
SOLANA_ENABLE_REAL_TRANSFERS=false  # DEMO SAFE: keeps payments simulated
SOLANA_REGISTRY_PROGRAM_ID=...
```

**Pricing (configurable per task)**
```
SOLANA_PRICE_SOL_EXECUTION=0.050
SOLANA_PRICE_SPL_EXECUTION=5.00
```

---

## Demo Workflow

### Step 1: Register User
```bash
POST /auth/register
{
  "email": "agent-owner@example.com",
  "password": "SecurePass123!",
  "name": "Alice"
}
```
→ Get JWT token, set cookie, receive dashboard

### Step 2: Register Agent
```bash
POST /agents/register
Authorization: Bearer <JWT>
{
  "agentName": "Treasury Risk Monitor",
  "publicKey": "8uQhQMGm4qMVM9Mp2HcJqKqB7GMGS7gqKq2m2ZzC7C4u",
  "description": "Monitors treasury and alerts on anomalies",
  "agentType": "Risk Monitoring Agent",
  "apiEndpoint": "https://agent.example.com/api"
}
```
→ Returns agent ID, fingerprint, reputation score

### Step 3: Link Wallet
```bash
POST /wallets/link
Authorization: Bearer <JWT>
{
  "agentId": "<agent-id>",
  "solanaAddress": "8uQhQMGm4qMVM9Mp2HcJqKqB7GMGS7gqKq2m2ZzC7C4u",
  "network": "devnet"
}
```
→ Agent wallet now linked

### Step 4: Verify Agent (Optional)
```bash
POST /agents/<agent-id>/verify
Authorization: Bearer <JWT>
```
→ Creates on-chain proof (if operator keypair configured)

### Step 5: Create Task
```bash
POST /tasks/request
Authorization: Bearer <JWT>
{
  "agentId": "<agent-id>",
  "taskType": "execution",
  "inputPayload": {
    "target": "swap",
    "network": "solana-devnet",
    "maxSlippageBps": 100
  }
}
```
→ Returns task ID

### Step 6: Simulate Task
```bash
POST /tasks/<task-id>/simulate
Authorization: Bearer <JWT>
{
  "scenario": "Token Swap",
  "inputPayload": { /* optional overrides */ }
}
```
→ Runs in Docker, returns metrics

### Step 7: Pay Task
```bash
POST /tasks/<task-id>/pay
Authorization: Bearer <JWT>
{
  "currency": "SOL"
}
```
→ Records payment (simulated by default)

### Step 8: Execute Task
```bash
POST /tasks/<task-id>/execute
Authorization: Bearer <JWT>
{
  "executeWithCRE": false
}
```
→ Records execution proof, creates transaction record

### Step 9: View History
```bash
GET /transactions/history
Authorization: Bearer <JWT>
```
→ See all payments, executions, totals

---

## Key Design Patterns

### Lazy Loading
Routes are loaded on-demand via `lazyRoute()` to avoid circular dependencies and improve startup time.

### Immutable Identity
Agents are identified by fingerprint (SHA256 hash). Public key is immutable.

### Simulated Proofs
When `SOLANA_ENABLE_REAL_PROOFS=false`, proofs are generated locally (no RPC calls). Safe for demos.

### Ownership Check
Every route checks `req.user.id` before returning user data. No cross-user data leaks.

### Graceful Degradation
If Solana is misconfigured, `/solana/status` returns `configErrors` instead of crashing.

### Audit Trail
Every action is logged to `UserAgentEvent` with timestamp, user, agent, and action type.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth fails | Check JWT expires in localStorage, verify SUPABASE_URL/keys |
| Payments simulated | Set `SOLANA_ENABLE_REAL_TRANSFERS=true` + fund operator wallet |
| No Solana proofs | Check `SOLANA_ENABLE_REAL_PROOFS=true` + operator keypair valid |
| Docker simulation fails | Ensure Docker daemon running, `agentity-sandbox` image built |
| DB sync errors | Set `DB_SYNC_ON_START=false`, apply schema manually via `npm run db:schema:apply` |

---

## File Structure Reference

```
src/
├── app.js                      # Express app setup + routes
├── server.js                   # Entry point, database init
├── config/
│   ├── database.js            # Sequelize ORM
│   ├── logger.js              # Winston logging
│   ├── solana.js              # Cluster config
│   └── supabase.js            # Auth client
├── middleware/
│   ├── auth.js                # JWT/cookie validation
│   └── logger.js              # Request logging
├── models/
│   ├── index.js               # Model associations
│   ├── agent.js               # Agent table
│   └── ... (other models)
├── routes/
│   ├── index.js               # Route registry
│   ├── auth.js                # Auth endpoints
│   ├── agents.js              # Agent CRUD
│   ├── tasks.js               # Task lifecycle
│   ├── solana.js              # Solana status/proofs
│   └── ... (other routes)
├── services/
│   ├── solana/
│   │   ├── client.js          # RPC connection
│   │   ├── registryService.js # On-chain proofs
│   │   ├── paymentService.js  # Payments
│   │   └── walletService.js   # Wallet linking
│   ├── sandbox/
│   │   ├── sandboxService.js  # Docker simulation
│   │   └── dockerRunner.js
│   ├── audit/
│   │   ├── logEvent.js
│   │   └── contractAuditService.js
│   ├── alerts/
│   │   ├── alertService.js
│   │   └── alertUtils.js
│   └── ...
└── utils/
    └── validation.js          # Input validation helpers
```

---

## Summary

**Agentity** is a **production-ready Solana trust & execution framework**:
- ✅ Decentralized agent identity & reputation
- ✅ Sandbox simulation before real execution
- ✅ On-chain proofs & audit trail
- ✅ Flexible payment (SOL/SPL) + policies
- ✅ Real-time alerts & monitoring
- ✅ Demo-safe with simulated proofs/transfers
