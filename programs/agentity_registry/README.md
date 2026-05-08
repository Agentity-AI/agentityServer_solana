# Agentity Registry Program

This Anchor scaffold models the Solana-native version of the Agentity registry.

The backend currently writes compact memo proofs so the hackathon demo works without a deployed program. Deploy this program when you want account-level composability for other Solana apps.

Accounts:

- `AgentProfile`: authority, agent id, fingerprint, capabilities hash, reputation score, action count, flag count.
- `CapabilityPolicy`: policy hash and maximum allowed risk score.
- `AgentActionLog`: action hash, result hash, risk score, timestamp.

Suggested flow:

```bash
anchor build
anchor deploy --provider.cluster devnet
```

Then set:

```bash
SOLANA_REGISTRY_PROGRAM_ID=<deployed program id>
```

The backend exposes the configured program id from `GET /solana/status`.
