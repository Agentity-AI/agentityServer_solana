const AgentWallet = require("../../models/agentWallet");
const { getSolanaCluster } = require("../../config/solana");
const { requireSolanaAddress, requireString } = require("../../utils/validation");

async function linkWalletToAgent({
  agentId,
  solanaAddress,
  solanaPublicKey,
  kmsKeyId = null,
  network = null,
}) {
  const address = requireSolanaAddress(solanaAddress, "solanaAddress");
  const publicKey = solanaPublicKey
    ? requireString(solanaPublicKey, "solanaPublicKey", { min: 32, max: 255 })
    : address;

  const [wallet, created] = await AgentWallet.findOrCreate({
    where: { agent_id: agentId },
    defaults: {
      agent_id: agentId,
      solana_address: address,
      solana_public_key: publicKey,
      kms_key_id: kmsKeyId || null,
      network: network || getSolanaCluster(),
      status: "linked",
    },
  });

  if (!created) {
    await wallet.update({
      solana_address: address,
      solana_public_key: publicKey,
      kms_key_id: kmsKeyId || null,
      network: network || getSolanaCluster(),
      status: "linked",
    });
  }

  return wallet;
}

module.exports = {
  linkWalletToAgent,
};
