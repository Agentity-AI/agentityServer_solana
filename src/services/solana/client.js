const { Connection } = require("@solana/web3.js");
const {
  getOperatorPublicKey,
  getRegistryProgramId,
  getSolanaCluster,
  getSolanaCommitment,
  getSolanaExplorerUrl,
  getSolanaRpcUrl,
  hasOperatorPublicKey,
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

function buildSolanaRuntimeStatus() {
  return {
    cluster: getSolanaCluster(),
    rpcUrl: getSolanaRpcUrl(),
    commitment: getSolanaCommitment(),
    operatorPublicKey: getOperatorPublicKey(),
    operatorConfigured: isSolanaOperatorConfigured(),
    operatorHasPublicKey: hasOperatorPublicKey(),
    operatorCanSign: hasOperatorSigner(),
    realPaymentsEnabled: process.env.SOLANA_ENABLE_REAL_TRANSFERS === "true",
    realProofsEnabled: process.env.SOLANA_ENABLE_REAL_PROOFS !== "false",
    registryProgramId: getRegistryProgramId(),
    proofMode: getRegistryProgramId() ? "anchor-ready-memo" : "memo",
  };
}

module.exports = {
  buildSolanaRuntimeStatus,
  getSolanaConnection,
  getSolanaExplorerUrl,
  getSolanaOperatorKeypair,
  isSolanaOperatorConfigured,
};
