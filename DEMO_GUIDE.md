# Agentity Demo Guide

## Quick Start

### Prerequisites
- Backend API running: `npm run dev:api` (listens on port 5000)
- Node.js 18+
- Valid Supabase credentials in `.env`
- Solana devnet connection (automatic)

### Run the Demo Script

```bash
# Run against local API
npm run smoke

# OR manually:
node scripts/demo.js http://localhost:5000

# OR against production
node scripts/demo.js https://agentityserver-solana.onrender.com
```

---

## Demo Workflow Explained

The demo script performs **15 end-to-end steps** to test the complete AI agent lifecycle:

### Phase 1: User & Agent Setup
1. **Register User** → Creates Supabase auth account, returns JWT
2. **Register Agent** → Creates AI agent with Solana public key
3. **Link Wallet** → Associates Solana address with agent
4. **Verify Agent** → Triggers on-chain proof (optional, requires Solana operator)
5. **Get Agent Details** → Retrieves full agent profile with reputation

### Phase 2: Task Lifecycle
6. **Create Task** → Requests execution task (e.g., "treasury-rebalance")
7. **Get Scenarios** → Lists available simulation types (Token Swap, NFT Mint, etc.)
8. **Simulate Task** → Runs task in Docker sandbox to test behavior
9. **Get Pricing** → Shows cost to execute (e.g., 0.050 SOL)
10. **Pay Task** → Records payment (simulated by default, no real SOL spent)
11. **Execute Task** → Runs agent logic and records proof

### Phase 3: Audit & Monitoring
12. **View Transactions** → Lists all user's payments + executions
13. **View Payment History** → Shows SOL/SPL payment records
14. **Check Solana Status** → Verifies blockchain runtime config
15. **Check System Health** → Validates database + API uptime

---

## What Each Step Tests

| Step | Endpoint | Tests | Demo Output |
|------|----------|-------|-------------|
| 1 | `POST /auth/register` | User creation, JWT generation | `Email: demo-XXX@agentity-test.com` |
| 2 | `POST /agents/register` | Agent registration, fingerprint | `Agent ID: ac0d...`, `Fingerprint: sha256(...)` |
| 3 | `POST /wallets/link` | Wallet linking to agent | `Wallet Status: linked` |
| 4 | `POST /agents/:id/verify` | Solana proof generation | `Proof Status: simulated or signed` |
| 5 | `GET /agents/:id` | Agent details + relationships | `Reputation Score: 50`, `Risk Level: medium` |
| 6 | `POST /tasks/request` | Task creation | `Task ID: 9e75...`, `Status: created` |
| 7 | `GET /simulation/scenarios` | Available scenarios | Lists: `Token Swap`, `Liquidity Pool`, etc. |
| 8 | `POST /tasks/:id/simulate` | Docker sandbox execution | `Execution Time: 250ms`, `Result: success` |
| 9 | `GET /payments/pricing` | Task pricing lookup | `Amount: 0.050 SOL` |
| 10 | `POST /tasks/:id/pay` | Payment recording | `Payment Status: paid` |
| 11 | `POST /tasks/:id/execute` | Task execution + proof | `Execution Status: completed` |
| 12 | `GET /transactions/history` | Transaction aggregation | `Total: 1`, `Total Volume: 0.050 SOL` |
| 13 | `GET /payments/history` | Payment records | Lists all payments for user |
| 14 | `GET /solana/status` | Runtime validation | `Cluster: devnet`, `Real Proofs: true/false` |
| 15 | `GET /system/status` | System health | `Database: connected`, `Uptime: XXXs` |

---

## Expected Outputs

### Success Case (All Green ✓)
```
✓ User registered successfully
✓ Agent registered successfully
✓ Wallet linked successfully
✓ Agent verified successfully
✓ Agent details retrieved
✓ Task created successfully
✓ Scenarios retrieved
✓ Simulation completed successfully
✓ Pricing retrieved
✓ Payment processed
✓ Task executed successfully
✓ Transaction history retrieved
✓ Payment history retrieved
✓ Solana status retrieved
✓ System status retrieved

✓ DEMO COMPLETED SUCCESSFULLY
```

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `Network error: ECONNREFUSED` | API not running | `npm run dev:api` in another terminal |
| `Verification failed: 401` | JWT expired | Re-run demo to get fresh JWT |
| `Agent registration failed: 400` | Invalid Solana public key | Demo auto-validates against test keys |
| `Wallet link failed: 404` | Agent ID not found | Ensure step 2 completed successfully |
| `Docker simulation failed` | Docker daemon not running | `docker daemon start` or skip Docker |
| `ENOTFOUND: supabase.co` | No internet/DNS issue | Check network connectivity |

---

## Useful Manual Testing Commands

### Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Test with Bearer Token
```bash
JWT="eyJhbGc..." # From register/login response

# Get authenticated user's agents
curl -X GET http://localhost:5000/agents/my \
  -H "Authorization: Bearer $JWT"

# Create agent
curl -X POST http://localhost:5000/agents/register \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "My Agent",
    "publicKey": "8uQhQMGm4qMVM9Mp2HcJqKqB7GMGS7gqKq2m2ZzC7C4u",
    "description": "My test agent"
  }'
```

### Test Public Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Solana status (no auth required)
curl http://localhost:5000/solana/status

# System status (no auth required)
curl http://localhost:5000/system/status

# API docs
curl http://localhost:5000/docs
```

---

## Integration with Frontend

After running the demo:

1. **Visit the frontend**: https://agentity-server-solana-client.vercel.app/
2. **Log in with demo credentials** (from script output):
   - Email: `demo-XXXXXX@agentity-test.com`
   - Password: `DemoPass123!`
3. **Observe results on dashboard**:
   - Agent shows up in "Registered Agents"
   - Task shows in "Recent Transactions"
   - Payment record visible
   - Reputation score updated

---

## Environment Variables for Demo Success

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
SOLANA_CLUSTER=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Optional but recommended for full features
SOLANA_ENABLE_REAL_PROOFS=true        # Real on-chain proofs (requires operator keypair)
SOLANA_ENABLE_REAL_TRANSFERS=false    # Keep this false for safe demos
SOLANA_OPERATOR_PUBLIC_KEY=xxx
SOLANA_OPERATOR_KEYPAIR_JSON=[1,2,3...]
```

---

## Performance Benchmarks (Expected)

| Operation | Time | Notes |
|-----------|------|-------|
| Register User | 500-800ms | Supabase auth + dashboard build |
| Register Agent | 200-400ms | Fingerprint generation |
| Link Wallet | 200-300ms | Database write |
| Verify Agent | 500-2000ms | May include RPC call if real proofs enabled |
| Simulate Task | 1000-3000ms | Docker container startup + execution |
| Pay Task | 300-800ms | If real, may include Solana RPC confirmation |
| Execute Task | 500-1500ms | Proof generation + recording |
| Get History | 200-400ms | Database query aggregation |

---

## Next Steps After Demo

1. **Frontend Integration**
   - Test UI workflows match API responses
   - Verify error handling

2. **Load Testing**
   - Run demo 10x in parallel: `for i in {1..10}; do node scripts/demo.js & done`
   - Monitor database connection pool

3. **Solana Integration**
   - Fund operator wallet with devnet SOL
   - Enable `SOLANA_ENABLE_REAL_TRANSFERS=true`
   - Verify on-chain transactions appear on Solana Explorer

4. **Production Deployment**
   - Switch to `SOLANA_CLUSTER=mainnet-beta`
   - Set `NODE_ENV=production`
   - Review security notes in README

---

## Troubleshooting Script Issues

### Script won't run
```bash
# Check Node version
node --version  # Should be 18+

# Try explicit permissions
chmod +x scripts/demo.js

# Run with full path
node /path/to/scripts/demo.js
```

### Script hangs
```bash
# Likely waiting for slow response
# Cancel with Ctrl+C and check:
curl http://localhost:5000/health  # API responding?
curl http://localhost:5000/docs    # Route exists?
```

### Cannot parse response
```bash
# Check API returning JSON
curl -v http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test","name":"test"}'
```

---

## Summary

The demo script is a **complete walkthrough** of the Agentity platform:
- ✅ User authentication
- ✅ Agent registration & linking
- ✅ Task simulation & payment
- ✅ Execution & proof recording
- ✅ History & monitoring

It's safe to run multiple times—each execution creates a unique user and agent, so no conflicts.

**Ready to go?** Run: `npm run dev:api` then `node scripts/demo.js http://localhost:5000`
