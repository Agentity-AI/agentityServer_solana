const express = require("express");
const router = express.Router();

const { getSolanaExplorerUrl } = require("../config/solana");
const {
  buildSolanaRuntimeStatus,
  getSolanaConnection,
} = require("../services/solana/client");
const { findProofBySignature } = require("../services/solana/registryService");
const { ValidationError, requireString } = require("../utils/validation");

/**
 * @openapi
 * tags:
 *   - name: Solana
 *     description: Solana network status and proof inspection
 */

/**
 * @openapi
 * /solana/status:
 *   get:
 *     tags: [Solana]
 *     summary: Get Solana runtime status
 *     responses:
 *       200:
 *         description: Solana runtime configuration
 */
router.get("/status", (req, res) => {
  return res.json(buildSolanaRuntimeStatus());
});

/**
 * @openapi
 * /solana/transactions/{signature}:
 *   get:
 *     tags: [Solana]
 *     summary: Inspect a Solana transaction and local Agentity proof
 *     parameters:
 *       - in: path
 *         name: signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Solana transaction signature
 *     responses:
 *       200:
 *         description: Transaction and local proof details
 *       400:
 *         description: Invalid signature
 */
router.get("/transactions/:signature", async (req, res, next) => {
  try {
    const signature = requireString(req.params.signature, "signature", {
      min: 32,
      max: 128,
    });
    const connection = getSolanaConnection();
    const [proof, status] = await Promise.all([
      findProofBySignature(signature),
      connection.getSignatureStatuses([signature]),
    ]);

    return res.json({
      signature,
      explorerUrl: getSolanaExplorerUrl(signature, "tx"),
      status: status?.value?.[0] || null,
      proof: proof
        ? {
            id: proof.id,
            agentId: proof.agent_id,
            type: proof.proof_type,
            proofHash: proof.proof_hash,
            payload: proof.proof_payload,
            createdAt: proof.created_at,
          }
        : null,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
});

module.exports = router;
