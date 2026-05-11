const test = require("node:test");
const assert = require("node:assert/strict");

const ENV_KEYS = [
  "SOLANA_OPERATOR_PUBLIC_KEY",
  "SOLANA_OPERATOR_KEYPAIR_JSON",
  "SOLANA_OPERATOR_SECRET_KEY",
  "SOLANA_OPERATOR_PRIVATE_KEY",
  "SOLANA_OPERATOR_KEYPAIR_PATH",
  "SOLANA_REGISTRY_PROGRAM_ID",
];

function loadFreshClient(env = {}) {
  const original = {};

  for (const key of ENV_KEYS) {
    original[key] = process.env[key];
    if (Object.hasOwn(env, key)) {
      process.env[key] = env[key];
    } else {
      delete process.env[key];
    }
  }

  delete require.cache[require.resolve("../src/config/solana")];
  delete require.cache[require.resolve("../src/services/solana/client")];

  const client = require("../src/services/solana/client");

  return {
    client,
    restore() {
      for (const key of ENV_KEYS) {
        if (original[key] == null) {
          delete process.env[key];
        } else {
          process.env[key] = original[key];
        }
      }
      delete require.cache[require.resolve("../src/config/solana")];
      delete require.cache[require.resolve("../src/services/solana/client")];
    },
  };
}

test("buildSolanaRuntimeStatus reports invalid Solana env without throwing", () => {
  const { client, restore } = loadFreshClient({
    SOLANA_OPERATOR_PUBLIC_KEY: "not-a-public-key",
    SOLANA_REGISTRY_PROGRAM_ID: "not-a-program-id",
  });

  try {
    const status = client.buildSolanaRuntimeStatus();

    assert.equal(status.status, "degraded");
    assert.equal(status.operatorPublicKey, null);
    assert.equal(status.registryProgramId, null);
    assert.equal(status.operatorCanSign, false);
    assert.ok(
      status.configErrors.some((message) =>
        message.includes("Invalid SOLANA_OPERATOR_PUBLIC_KEY"),
      ),
    );
    assert.ok(
      status.configErrors.some((message) =>
        message.includes("Invalid SOLANA_REGISTRY_PROGRAM_ID"),
      ),
    );
  } finally {
    restore();
  }
});
