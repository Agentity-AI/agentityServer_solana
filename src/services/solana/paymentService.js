const {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
} = require("@solana/spl-token");

const PaymentRecord = require("../../models/paymentRecord");
const AgentWallet = require("../../models/agentWallet");
const {
  getSolanaConnection,
  getSolanaExplorerUrl,
  getSolanaOperatorKeypair,
} = require("./client");
const { getSolanaCluster } = require("../../config/solana");

const DEFAULT_SOL_PRICING = {
  simulation: "0.010",
  audit: "0.020",
  execution: "0.050",
  coordination: "0.015",
};

const DEFAULT_SPL_PRICING = {
  simulation: "1.00",
  audit: "2.50",
  execution: "5.00",
  coordination: "1.50",
};

function normalizeCurrency(currency) {
  return String(currency || "SOL").trim().toUpperCase();
}

function getEnvPrice(prefix, taskType) {
  const key = `${prefix}_${String(taskType || "execution").toUpperCase()}`
    .replace(/[^A-Z0-9_]/g, "_");

  return process.env[key] || null;
}

function computeQuoteAmount(taskType, currency = "SOL") {
  const normalizedCurrency = normalizeCurrency(currency);
  const isSol = normalizedCurrency === "SOL";
  const envPrefix = isSol ? "SOLANA_PRICE_SOL" : "SOLANA_PRICE_SPL";
  const defaultTable = isSol ? DEFAULT_SOL_PRICING : DEFAULT_SPL_PRICING;

  return (
    getEnvPrice(envPrefix, taskType) ||
    defaultTable[taskType] ||
    defaultTable.execution
  );
}

function decimalToAtomic(value, decimals) {
  const normalized = String(value).trim();
  const [wholePart, rawFraction = ""] = normalized.split(".");
  const whole = BigInt(wholePart || "0");
  const fraction = rawFraction.padEnd(decimals, "0").slice(0, decimals);
  const fractionValue = BigInt(fraction || "0");

  return whole * 10n ** BigInt(decimals) + fractionValue;
}

function resolveTokenDecimals({ currency, tokenDecimals }) {
  if (normalizeCurrency(currency) === "SOL") return 9;
  return Number.isInteger(tokenDecimals) ? tokenDecimals : 6;
}

async function createPaymentQuote({
  fromUserId,
  toAgentId,
  taskExecutionId = null,
  taskType,
  currency = "SOL",
  tokenMint = null,
  tokenDecimals = null,
  metadata = null,
}) {
  const normalizedCurrency = normalizeCurrency(currency);
  const decimals = resolveTokenDecimals({
    currency: normalizedCurrency,
    tokenDecimals,
  });
  const amount = computeQuoteAmount(taskType, normalizedCurrency);
  const amountAtomic = decimalToAtomic(amount, decimals);

  const payment = await PaymentRecord.create({
    from_user_id: fromUserId,
    to_agent_id: toAgentId,
    task_execution_id: taskExecutionId,
    amount,
    amount_atomic: amountAtomic.toString(),
    currency: normalizedCurrency,
    token_mint: tokenMint,
    token_decimals: decimals,
    status: "quoted",
    metadata: {
      taskType,
      network: getSolanaCluster(),
      ...metadata,
    },
  });

  return payment;
}

async function executeSolTransfer({ connection, operator, wallet, amountAtomic }) {
  const destination = new PublicKey(wallet.solana_address);
  const lamports = Number(amountAtomic);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: operator.publicKey,
      toPubkey: destination,
      lamports,
    }),
  );

  return sendAndConfirmTransaction(connection, tx, [operator], {
    commitment: "confirmed",
  });
}

async function executeSplTransfer({
  connection,
  operator,
  wallet,
  amountAtomic,
  tokenMint,
}) {
  if (!tokenMint) {
    throw new Error("tokenMint is required for SPL token payments");
  }

  const mint = new PublicKey(tokenMint);
  const destination = new PublicKey(wallet.solana_address);
  const sourceAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    operator,
    mint,
    operator.publicKey,
  );
  const destinationAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    operator,
    mint,
    destination,
  );

  const tx = new Transaction().add(
    createTransferInstruction(
      sourceAccount.address,
      destinationAccount.address,
      operator.publicKey,
      BigInt(amountAtomic),
    ),
  );

  return sendAndConfirmTransaction(connection, tx, [operator], {
    commitment: "confirmed",
  });
}

async function executeSolanaPayment(paymentRecord) {
  const wallet = await AgentWallet.findOne({
    where: { agent_id: paymentRecord.to_agent_id, status: "linked" },
  });

  if (!wallet) {
    throw new Error("Agent Solana wallet is not linked");
  }

  const operator = getSolanaOperatorKeypair();
  const realTransfersEnabled = process.env.SOLANA_ENABLE_REAL_TRANSFERS === "true";

  if (!operator || !realTransfersEnabled) {
    const updated = await paymentRecord.update({
      status: "paid",
      payment_reference: "simulated-solana-payment",
      metadata: {
        ...(paymentRecord.metadata || {}),
        simulated: true,
        intendedRecipient: wallet.solana_address,
        operatorConfigured: Boolean(operator),
      },
    });

    return {
      payment: updated,
      signature: null,
      explorerUrl: null,
      simulated: true,
    };
  }

  await paymentRecord.update({ status: "pending" });

  const connection = getSolanaConnection();
  const currency = normalizeCurrency(paymentRecord.currency);
  const signature =
    currency === "SOL"
      ? await executeSolTransfer({
          connection,
          operator,
          wallet,
          amountAtomic: paymentRecord.amount_atomic,
        })
      : await executeSplTransfer({
          connection,
          operator,
          wallet,
          amountAtomic: paymentRecord.amount_atomic,
          tokenMint: paymentRecord.token_mint,
        });

  const explorerUrl = getSolanaExplorerUrl(signature, "tx");
  const updated = await paymentRecord.update({
    status: "paid",
    solana_signature: signature,
    payment_reference: explorerUrl,
    metadata: {
      ...(paymentRecord.metadata || {}),
      simulated: false,
      recipient: wallet.solana_address,
    },
  });

  return {
    payment: updated,
    signature,
    explorerUrl,
    simulated: false,
  };
}

async function listPaymentsForUser(userId) {
  return PaymentRecord.findAll({
    where: { from_user_id: userId },
    order: [["created_at", "DESC"]],
    limit: 100,
  });
}

module.exports = {
  computeQuoteAmount,
  createPaymentQuote,
  decimalToAtomic,
  executeSolanaPayment,
  listPaymentsForUser,
};
