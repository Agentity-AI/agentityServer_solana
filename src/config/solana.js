const fs = require("fs");
const path = require("path");
const { clusterApiUrl, Keypair, PublicKey } = require("@solana/web3.js");
const bs58Module = require("bs58");

const bs58 = bs58Module.default || bs58Module;

const SUPPORTED_CLUSTERS = new Set(["mainnet-beta", "testnet", "devnet", "localnet"]);

let cachedOperatorKeypair = undefined;

function getSolanaCluster() {
  const cluster = process.env.SOLANA_CLUSTER || process.env.SOLANA_NETWORK || "devnet";
  return SUPPORTED_CLUSTERS.has(cluster) ? cluster : "devnet";
}

function getSolanaRpcUrl() {
  if (process.env.SOLANA_RPC_URL) {
    return process.env.SOLANA_RPC_URL;
  }

  const cluster = getSolanaCluster();
  if (cluster === "localnet") {
    return "http://127.0.0.1:8899";
  }

  return clusterApiUrl(cluster);
}

function getSolanaCommitment() {
  return process.env.SOLANA_COMMITMENT || "confirmed";
}

function getSolanaExplorerUrl(value, type = "tx") {
  const cluster = getSolanaCluster();
  const clusterParam = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://explorer.solana.com/${type}/${value}${clusterParam}`;
}

function parseSecretKey(rawSecret) {
  if (!rawSecret || typeof rawSecret !== "string") {
    return null;
  }

  const value = rawSecret.trim();
  if (!value) {
    return null;
  }

  try {
    if (value.startsWith("[") && value.endsWith("]")) {
      const parsed = JSON.parse(value);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Secret key JSON must be a non-empty array.");
      }

      const bytes = Uint8Array.from(parsed);

      if (bytes.length !== 64 && bytes.length !== 32) {
        throw new Error("Secret key array must contain 32 or 64 bytes.");
      }

      return bytes;
    }

    const decoded = bs58.decode(value);

    if (decoded.length !== 64 && decoded.length !== 32) {
      throw new Error("Base58 secret key must decode to 32 or 64 bytes.");
    }

    return decoded;
  } catch (error) {
    throw new Error(`Invalid Solana secret key format: ${error.message}`);
  }
}

function resolveKeypairPath() {
  const configuredPath =
    process.env.SOLANA_OPERATOR_KEYPAIR_PATH || process.env.SOLANA_KEYPAIR_PATH;

  if (!configuredPath) {
    return null;
  }

  return path.resolve(configuredPath);
}

function readKeypairPath() {
  const keypairPath = resolveKeypairPath();

  if (!keypairPath) {
    return null;
  }

  try {
    return fs.readFileSync(keypairPath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read Solana keypair file at "${keypairPath}": ${error.message}`);
  }
}

function loadOperatorKeypair() {
  if (cachedOperatorKeypair !== undefined) {
    return cachedOperatorKeypair;
  }

  const secretSource =
    process.env.SOLANA_OPERATOR_KEYPAIR_JSON ||
    process.env.SOLANA_OPERATOR_SECRET_KEY ||
    process.env.SOLANA_OPERATOR_PRIVATE_KEY ||
    readKeypairPath();

  if (!secretSource) {
    cachedOperatorKeypair = null;
    return cachedOperatorKeypair;
  }

  try {
    const secretKey = parseSecretKey(secretSource);
    cachedOperatorKeypair = secretKey ? Keypair.fromSecretKey(secretKey) : null;
    return cachedOperatorKeypair;
  } catch (error) {
    throw new Error(`Failed to load Solana operator keypair: ${error.message}`);
  }
}

function getOperatorPublicKey() {
  const configuredPublicKey = process.env.SOLANA_OPERATOR_PUBLIC_KEY;

  if (configuredPublicKey) {
    try {
      return new PublicKey(configuredPublicKey).toBase58();
    } catch (error) {
      throw new Error(`Invalid SOLANA_OPERATOR_PUBLIC_KEY: ${error.message}`);
    }
  }

  const keypair = loadOperatorKeypair();
  return keypair ? keypair.publicKey.toBase58() : null;
}

function hasOperatorPublicKey() {
  return Boolean(getOperatorPublicKey());
}

function hasOperatorSigner() {
  return Boolean(loadOperatorKeypair());
}

function getRegistryProgramId() {
  const value = process.env.SOLANA_REGISTRY_PROGRAM_ID;
  if (!value) {
    return null;
  }

  try {
    return new PublicKey(value).toBase58();
  } catch (error) {
    throw new Error(`Invalid SOLANA_REGISTRY_PROGRAM_ID: ${error.message}`);
  }
}

module.exports = {
  getOperatorPublicKey,
  getRegistryProgramId,
  getSolanaCluster,
  getSolanaCommitment,
  getSolanaExplorerUrl,
  getSolanaRpcUrl,
  hasOperatorPublicKey,
  hasOperatorSigner,
  loadOperatorKeypair,
};