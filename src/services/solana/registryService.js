const crypto = require("crypto");
const {
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

const logger = require("../../config/logger");
const AgentBehaviorLog = require("../../models/agentBehaviorLog");
const AgentReputation = require("../../models/agentReputation");
const AgentSolanaProof = require("../../models/agentSolanaProof");
const AgentSolanaRegistry = require("../../models/agentSolanaRegistry");
const {
  getRegistryProgramId,
  getSolanaCluster,
  getSolanaExplorerUrl,
} = require("../../config/solana");
const {
  getSolanaConnection,
  getSolanaOperatorKeypair,
} = require("./client");

const MEMO_PROGRAM_ID = new PublicKey(
  process.env.SOLANA_MEMO_PROGRAM_ID ||
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);
const HEALTHY_THRESHOLD = Number.parseInt(
  process.env.SOLANA_HEALTHY_THRESHOLD || "60",
  10,
);

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== "object") return value;

  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObject(value[key]);
      return acc;
    }, {});
}

function stableJson(value) {
  return JSON.stringify(sortObject(value));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function buildProofPayload({ type, agent, extra = {} }) {
  const body = {
    type,
    agentId: agent.id,
    agentName: agent.agent_name,
    fingerprint: agent.fingerprint,
    publicKey: agent.public_key,
    platform: "Agentity",
    network: getSolanaCluster(),
    registryProgramId: getRegistryProgramId(),
    timestamp: new Date().toISOString(),
    ...extra,
  };

  const canonical = stableJson(body);

  return {
    body,
    hash: sha256(canonical),
    memo: `AGENTITY:${type}:${agent.id}:${sha256(canonical)}`,
  };
}

async function submitMemoProof({ memo }) {
  const operator = getSolanaOperatorKeypair();
  const realProofsEnabled = process.env.SOLANA_ENABLE_REAL_PROOFS !== "false";

  if (!operator || !realProofsEnabled) {
    return {
      signature: null,
      slot: null,
      status: "simulated",
      simulated: true,
    };
  }

  const connection = getSolanaConnection();
  const tx = new Transaction().add(
    new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo, "utf8"),
    }),
  );

  const signature = await sendAndConfirmTransaction(connection, tx, [operator], {
    commitment: "confirmed",
  });
  const status = await connection.getSignatureStatuses([signature]);
  const slot = status?.value?.[0]?.slot || null;

  return {
    signature,
    slot,
    status: "confirmed",
    simulated: false,
  };
}

function riskLevel(score) {
  if (score >= 85) return "safe";
  if (score >= 70) return "low";
  if (score >= 50) return "medium";
  return "high";
}

async function persistAgentReputation(agentId, score, level) {
  const existing = await AgentReputation.findOne({
    where: { agent_id: agentId },
    order: [["updatedAt", "DESC"], ["createdAt", "DESC"]],
  });

  if (existing) {
    return existing.update({
      score,
      risk_level: level,
    });
  }

  return AgentReputation.create({
    agent_id: agentId,
    score,
    risk_level: level,
  });
}

async function calculateTrustScore(agentId, proofRows) {
  let score = 75;

  const verifications = proofRows.filter((row) =>
    ["VERIFIED", "REVERIFIED"].includes(row.proof_type),
  );
  const recentPasses = verifications.slice(-5).filter((row) => row.is_healthy)
    .length;
  score += recentPasses * 3;

  const flagCount = proofRows.filter((row) => row.proof_type === "AGENT_FLAGGED")
    .length;
  score -= flagCount * 15;

  const simLogs = await AgentBehaviorLog.findAll({
    where: { agent_id: agentId, event_type: "simulation" },
    order: [["createdAt", "DESC"]],
    limit: 10,
  });

  if (simLogs.length > 0) {
    const avgRisk =
      simLogs.reduce((sum, log) => {
        const raw = Number.parseFloat(log.risk_score) || 0;
        return sum + (raw <= 1 ? raw * 100 : raw);
      }, 0) / simLogs.length;

    score -= Math.floor(avgRisk * 0.3);
  }

  const reputation = await AgentReputation.findOne({ where: { agent_id: agentId } });
  if (reputation && Number(reputation.score) > 0) {
    score = Math.round(score * 0.7 + Number(reputation.score) * 0.3);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

async function createProofRow({ agentId, proof, submission, score, isHealthy, scoreDelta }) {
  return AgentSolanaProof.create({
    agent_id: agentId,
    signature: submission.signature,
    slot: submission.slot,
    proof_type: proof.body.type,
    proof_hash: proof.hash,
    proof_payload: proof.body,
    memo: proof.memo,
    score,
    is_healthy: isHealthy,
    score_delta: scoreDelta,
    network: getSolanaCluster(),
    status: submission.status,
  });
}

async function ensureAgentRegistered(agent) {
  const existing = await AgentSolanaRegistry.findOne({
    where: { agent_id: agent.id },
  });
  if (existing) return existing;

  const proof = buildProofPayload({
    type: "AGENT_REGISTERED",
    agent,
  });
  const submission = await submitMemoProof({ memo: proof.memo });

  const registry = await AgentSolanaRegistry.create({
    agent_id: agent.id,
    registry_address: null,
    registration_signature: submission.signature,
    registration_slot: submission.slot,
    proof_hash: proof.hash,
    status: "registered",
    network: getSolanaCluster(),
    metadata: {
      proofMode: getRegistryProgramId() ? "anchor-ready-memo" : "memo",
      simulated: submission.simulated,
      explorerUrl: submission.signature
        ? getSolanaExplorerUrl(submission.signature, "tx")
        : null,
    },
  });

  await createProofRow({
    agentId: agent.id,
    proof,
    submission,
    score: null,
    isHealthy: null,
    scoreDelta: null,
  });

  await agent.update({
    blockchain_tx_hash: submission.signature,
    blockchain_registered_at: new Date(),
    blockchain_sync_status: submission.simulated ? "pending" : "synced",
    blockchain_sync_error: null,
  });

  logger.info({
    message: `[solana] Agent ${agent.id} registered proof ${submission.signature || "simulated"}`,
  });

  return registry;
}

async function runImmediateVerification(agent, registry) {
  const proofs = await AgentSolanaProof.findAll({
    where: { agent_id: agent.id },
    order: [["created_at", "ASC"]],
  });
  const score = await calculateTrustScore(agent.id, proofs);
  const level = riskLevel(score);
  const isHealthy = score >= HEALTHY_THRESHOLD;
  const previousScore = Number(registry.current_score || 0);
  const scoreDelta = score - previousScore;
  const proof = buildProofPayload({
    type: isHealthy ? "VERIFIED" : "AGENT_FLAGGED",
    agent,
    extra: {
      score,
      riskLevel: level,
      healthyThreshold: HEALTHY_THRESHOLD,
      isHealthy,
    },
  });

  const submission = await submitMemoProof({ memo: proof.memo });
  const proofRow = await createProofRow({
    agentId: agent.id,
    proof,
    submission,
    score,
    isHealthy,
    scoreDelta,
  });

  await registry.update({
    current_score: score,
    current_risk_level: level,
    last_verified_at: new Date(),
    verification_count: (registry.verification_count || 0) + 1,
    status: isHealthy ? "verified" : "flagged",
    metadata: {
      ...(registry.metadata || {}),
      latestProofId: proofRow.id,
      latestSignature: submission.signature,
      latestExplorerUrl: submission.signature
        ? getSolanaExplorerUrl(submission.signature, "tx")
        : null,
      simulated: submission.simulated,
    },
  });

  await persistAgentReputation(agent.id, score, level);

  await agent.update({
    blockchain_tx_hash: submission.signature || agent.blockchain_tx_hash,
    blockchain_sync_status: submission.simulated ? "pending" : "synced",
    blockchain_sync_error: null,
  });

  return {
    signature: submission.signature,
    slot: submission.slot,
    proofHash: proof.hash,
    score,
    isHealthy,
    riskLevel: level,
    verificationCount: (registry.verification_count || 0) + 1,
    explorerUrl: submission.signature
      ? getSolanaExplorerUrl(submission.signature, "tx")
      : null,
    simulated: submission.simulated,
  };
}

async function createExecutionProof({ agent, task, executionResult, riskScore }) {
  const proof = buildProofPayload({
    type: "TASK_EXECUTED",
    agent,
    extra: {
      taskId: task.id,
      taskType: task.task_type,
      riskScore,
      executionHash: sha256(stableJson(executionResult || {})),
    },
  });
  const submission = await submitMemoProof({ memo: proof.memo });
  const proofRow = await createProofRow({
    agentId: agent.id,
    proof,
    submission,
    score: null,
    isHealthy: null,
    scoreDelta: null,
  });

  return {
    id: proofRow.id,
    signature: submission.signature,
    slot: submission.slot,
    proofHash: proof.hash,
    explorerUrl: submission.signature
      ? getSolanaExplorerUrl(submission.signature, "tx")
      : null,
    simulated: submission.simulated,
  };
}

async function getAgentHistory(agentId) {
  return AgentSolanaProof.findAll({
    where: { agent_id: agentId },
    order: [["created_at", "ASC"]],
  });
}

async function findProofBySignature(signature) {
  return AgentSolanaProof.findOne({
    where: { signature },
  });
}

module.exports = {
  createExecutionProof,
  ensureAgentRegistered,
  findProofBySignature,
  getAgentHistory,
  runImmediateVerification,
};
