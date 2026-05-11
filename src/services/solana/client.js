const { Connection } = require("@solana/web3.js");
const {
  getOperatorPublicKey,
  getRegistryProgramId,
  getSolanaCluster,
  getSolanaCommitment,
  getSolanaExplorerUrl,
  getSolanaRpcUrl,
  hasOperatorSigner,
  loadOperatorKeypair,
} = require("../../config/solana");

let cachedConnection = null;

function getSolanaConnection() {
  if (!cachedConnection) {
    cachedConnection = new Connection(getSolanaRpcUrl(), getSolanaCommitment());
  }

  return cachedConnection;
}

function getSolanaOperatorKeypair({ required = false } = {}) {
  const keypair = loadOperatorKeypair();

  if (!keypair && required) {
    throw new Error(
      "Missing Solana operator keypair. Set SOLANA_OPERATOR_KEYPAIR_JSON, SOLANA_OPERATOR_SECRET_KEY, SOLANA_OPERATOR_PRIVATE_KEY, or SOLANA_OPERATOR_KEYPAIR_PATH.",
    );
  }

  return keypair;
}

function isSolanaOperatorConfigured() {
  return hasOperatorSigner();
}

function readSolanaConfig(label, reader, fallback, errors) {
  try {
    return reader();
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
    return fallback;
  }
}

function buildSolanaRuntimeStatus() {
  const configErrors = [];
  const cluster = readSolanaConfig("SOLANA_CLUSTER", getSolanaCluster, "devnet", configErrors);
  const rpcUrl = readSolanaConfig("SOLANA_RPC_URL", getSolanaRpcUrl, null, configErrors);
  const commitment = readSolanaConfig(
    "SOLANA_COMMITMENT",
    getSolanaCommitment,
    "confirmed",
    configErrors,
  );
  const operatorPublicKey = readSolanaConfig(
    "SOLANA_OPERATOR_PUBLIC_KEY",
    getOperatorPublicKey,
    null,
    configErrors,
  );
  const operatorCanSign = readSolanaConfig(
    "SOLANA_OPERATOR_KEYPAIR",
    isSolanaOperatorConfigured,
    false,
    configErrors,
  );
  const registryProgramId = readSolanaConfig(
    "SOLANA_REGISTRY_PROGRAM_ID",
    getRegistryProgramId,
    null,
    configErrors,
  );

  return {
    status: configErrors.length > 0 ? "degraded" : "ready",
    cluster,
    rpcUrl,
    commitment,
    operatorPublicKey,
    operatorConfigured: operatorCanSign,
    operatorHasPublicKey: Boolean(operatorPublicKey),
    operatorCanSign,
    realPaymentsEnabled: process.env.SOLANA_ENABLE_REAL_TRANSFERS === "true",
    realProofsEnabled: process.env.SOLANA_ENABLE_REAL_PROOFS !== "false",
    registryProgramId,
    proofMode: registryProgramId ? "anchor-ready-memo" : "memo",
    configErrors,
  };
}

module.exports = {
  buildSolanaRuntimeStatus,
  getSolanaConnection,
  getSolanaExplorerUrl,
  getSolanaOperatorKeypair,
  isSolanaOperatorConfigured,
};
