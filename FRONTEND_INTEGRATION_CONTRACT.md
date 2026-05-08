# Frontend Integration Contract

Swagger is the implementation source of truth:

```text
GET /docs
```

Local API:

```text
http://localhost:5000
```

## Auth

Use bearer JWTs from:

```text
POST /auth/register
POST /auth/login
```

Protected requests should send:

```http
Authorization: Bearer <jwt>
```

The backend also sets `agentity_jwt` as an httpOnly cookie.

## Register Agent

```text
POST /agents/register
```

Payload:

```json
{
  "agentName": "Treasury Risk Monitor",
  "agentType": "Risk Monitoring Agent",
  "publicKey": "8uQhQMGm4qMVM9Mp2HcJqKqB7GMGS7gqKq2m2ZzC7C4u",
  "description": "Monitors treasury and payment risk.",
  "apiEndpoint": "https://agent.example.com/run",
  "metadata": {
    "network": "solana-devnet",
    "provider": "openai"
  }
}
```

Use `GET /agents/types` to populate the type dropdown.

## Link Solana Wallet

```text
POST /wallets/link
```

Payload:

```json
{
  "agentId": "AGENT_UUID",
  "solanaAddress": "8uQhQMGm4qMVM9Mp2HcJqKqB7GMGS7gqKq2m2ZzC7C4u",
  "solanaPublicKey": "8uQhQMGm4qMVM9Mp2HcJqKqB7GMGS7gqKq2m2ZzC7C4u",
  "network": "devnet"
}
```

`solanaPublicKey` is optional and defaults to `solanaAddress`.

## Verify Agent

```text
POST /agents/{id}/verify
```

Optional payload:

```json
{
  "solanaAddress": "8uQhQMGm4qMVM9Mp2HcJqKqB7GMGS7gqKq2m2ZzC7C4u",
  "network": "devnet"
}
```

Response includes:

```json
{
  "success": true,
  "verificationStatus": "verified",
  "solanaSyncStatus": "synced",
  "solana": {
    "signature": "SOLANA_SIGNATURE_OR_NULL",
    "proofHash": "SHA256_HASH",
    "trustScore": 78,
    "riskLevel": "low",
    "explorerUrl": "https://explorer.solana.com/tx/..."
  }
}
```

If the backend is not configured with a Solana operator keypair, `solanaSyncStatus` will be `simulated`.

## Proof History

```text
GET /agents/{id}/solana-history
```

Use this for the agent detail audit tab. Each item includes `type`, `proofHash`, optional `signature`, optional `explorerUrl`, and local payload.

## Simulation

```text
POST /simulation/run
```

Payload:

```json
{
  "agentId": "AGENT_UUID",
  "scenarioType": "Token Swap",
  "parameters": {
    "amount": 10,
    "tokenIn": "USDC",
    "tokenOut": "SOL"
  }
}
```

For task flow, use:

```text
POST /tasks/{id}/simulate
```

## Task Lifecycle

Create:

```text
POST /tasks/request
```

```json
{
  "agentId": "AGENT_UUID",
  "taskType": "execution",
  "inputPayload": {
    "target": "swap",
    "network": "solana-devnet",
    "tokenOut": "SOL"
  }
}
```

Simulate:

```text
POST /tasks/{id}/simulate
```

Pay with SOL:

```text
POST /tasks/{id}/pay
```

```json
{
  "currency": "SOL"
}
```

Pay with SPL:

```json
{
  "currency": "CASH-SPL",
  "tokenMint": "TOKEN_MINT_ADDRESS",
  "tokenDecimals": 6
}
```

Execute:

```text
POST /tasks/{id}/execute
```

Execution response includes `execution`, `kms`, and `solanaProof`.

## Dashboard And Lists

Use:

```text
GET /dashboard/overview
GET /agents/my
GET /tasks/history
GET /payments/history
GET /transactions/history
GET /alerts
GET /alerts/summary
```

Payment rows now use:

```json
{
  "amount": 0.05,
  "amountAtomic": "50000000",
  "currency": "SOL",
  "solanaSignature": "SIGNATURE_OR_NULL",
  "explorerUrl": "https://explorer.solana.com/tx/..."
}
```

## Runtime Status

```text
GET /system/status
GET /solana/status
```

Use these to show whether the API is connected, whether Solana proofs are real or simulated, and whether real transfers are enabled.
