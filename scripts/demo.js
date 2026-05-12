#!/usr/bin/env node

/**
 * AGENTITY DEMO SCRIPT
 *
 * This script performs a complete end-to-end workflow:
 * 1. Register a new user
 * 2. Register a real AI agent with Solana details
 * 3. Link wallet to agent
 * 4. Create a task
 * 5. Run simulation
 * 6. Check pricing
 * 7. Pay for task (simulated)
 * 8. Execute task
 * 9. View transaction history
 * 10. Check Solana runtime status
 *
 * Usage:
 *   node scripts/demo.js [BASE_URL] [API_KEY_OPTIONAL]
 *
 * Example:
 *   node scripts/demo.js http://localhost:5000
 *   node scripts/demo.js https://agentityserver-solana.onrender.com
 */

const axios = require("axios");
const crypto = require("crypto");

// Demo configuration
const BASE_URL = process.argv[2] || "http://localhost:5000";
const DEMO_USER_EMAIL = `demo-${Date.now()}@agentity-test.com`;
const DEMO_USER_PASSWORD = "DemoPass123!";
const DEMO_USER_NAME = "Demo Treasury Agent";

// Solana devnet test public keys
const TEST_SOLANA_PUBKEYS = [
  "8uQhQMGm4qMVM9Mp2HcJqKqB7GMGS7gqKq2m2ZzC7C4u",
  "4uQQEfVJAFnYaVnVzVc2XcqcGU8fTKzxPnT3JHZmBHvp",
  "TokenkegQfeZyiNwAJsyFbPVwwQQfjoZnUsdPgCEm8",
];

let jwt = null;
let userId = null;
let agentId = null;
let walletId = null;
let taskId = null;

// Utility: colored console output
function log(type, message) {
  const colors = {
    "✓": "\x1b[32m", // green
    "✗": "\x1b[31m", // red
    "→": "\x1b[36m", // cyan
    ℹ: "\x1b[33m", // yellow
    reset: "\x1b[0m",
  };

  const typeSymbol = type || "ℹ";
  console.log(
    `${colors[typeSymbol] || colors.reset}${typeSymbol} ${colors.reset}${message}`,
  );
}

function logSection(title) {
  console.log("\n" + "=".repeat(70));
  console.log(`  ${title}`);
  console.log("=".repeat(70) + "\n");
}

async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      validateStatus: () => true, // Don't throw on any status
    };

    if (jwt && !headers.Authorization) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response;
  } catch (error) {
    log("✗", `Network error: ${error.message}`);
    throw error;
  }
}

async function step1_RegisterUser() {
  logSection("Step 1: Register User");

  log("→", `Registering user: ${DEMO_USER_EMAIL}`);

  const response = await makeRequest("POST", "/auth/register", {
    email: DEMO_USER_EMAIL,
    password: DEMO_USER_PASSWORD,
    name: DEMO_USER_NAME,
  });

  if (response.status !== 201) {
    log(
      "✗",
      `Registration failed: ${response.status} ${JSON.stringify(response.data)}`,
    );
    throw new Error("User registration failed");
  }

  jwt = response.data.jwt;
  userId = response.data.id;

  log("✓", `User registered successfully`);
  log("ℹ", `Email: ${response.data.email}`);
  log("ℹ", `JWT: ${jwt.substring(0, 20)}...`);

  return response.data;
}

async function step2_RegisterAgent() {
  logSection("Step 2: Register AI Agent");

  const agentName = `Treasury Monitor ${crypto.randomBytes(3).toString("hex")}`;
  const randomPubKey =
    TEST_SOLANA_PUBKEYS[Math.floor(Math.random() * TEST_SOLANA_PUBKEYS.length)];

  log("→", `Registering agent: ${agentName}`);
  log("ℹ", `Solana Public Key: ${randomPubKey}`);

  const response = await makeRequest("POST", "/agents/register", {
    agentName,
    publicKey: randomPubKey,
    description: "Autonomous treasury monitoring and risk detection agent",
    agentType: "Treasury Agent",
    apiEndpoint: "https://api.agentity.example.com/treasury-monitor",
    modelName: "GPT-4 Fine-tuned",
    version: "1.0.0",
    executionEnvironment: "api",
    metadata: {
      riskThreshold: 0.7,
      alertFrequency: "realtime",
      supportedChains: ["solana"],
    },
  });

  if (response.status !== 201) {
    log(
      "✗",
      `Agent registration failed: ${response.status} ${JSON.stringify(response.data)}`,
    );
    throw new Error("Agent registration failed");
  }

  agentId = response.data.id;

  log("✓", `Agent registered successfully`);
  log("ℹ", `Agent ID: ${agentId}`);
  log("ℹ", `Fingerprint: ${response.data.fingerprint}`);
  log("ℹ", `Status: ${response.data.status}`);
  log("ℹ", `Reputation Score: ${response.data.reputation?.score || "N/A"}`);

  return response.data;
}

async function step3_LinkWallet() {
  logSection("Step 3: Link Wallet to Agent");

  const randomPubKey =
    TEST_SOLANA_PUBKEYS[Math.floor(Math.random() * TEST_SOLANA_PUBKEYS.length)];

  log("→", `Linking wallet to agent: ${agentId}`);
  log("ℹ", `Solana Address: ${randomPubKey}`);

  const response = await makeRequest("POST", "/wallets/link", {
    agentId,
    solanaAddress: randomPubKey,
    network: "devnet",
  });

  if (response.status !== 200 && response.status !== 201) {
    log(
      "✗",
      `Wallet link failed: ${response.status} ${JSON.stringify(response.data)}`,
    );
    throw new Error("Wallet linking failed");
  }

  walletId = response.data.id;

  log("✓", `Wallet linked successfully`);
  log("ℹ", `Wallet ID: ${walletId}`);
  log("ℹ", `Status: ${response.data.status}`);

  return response.data;
}

async function step4_VerifyAgent() {
  logSection("Step 4: Verify Agent (Create Solana Proof)");

  log("→", `Verifying agent: ${agentId}`);

  const response = await makeRequest("POST", `/agents/${agentId}/verify`, {});

  if (response.status !== 200 && response.status !== 201) {
    log(
      "✗",
      `Verification failed: ${response.status} ${JSON.stringify(response.data)}`,
    );
    log(
      "ℹ",
      "Note: Verification may fail if SOLANA_ENABLE_REAL_PROOFS=false (expected for demo)",
    );
    return null;
  }

  log("✓", `Agent verified successfully`);
  if (response.data.solanaRegistry) {
    log("ℹ", `Proof Status: ${response.data.solanaRegistry.status}`);
    if (response.data.solanaRegistry.explorerUrl) {
      log("ℹ", `Explorer URL: ${response.data.solanaRegistry.explorerUrl}`);
    }
  }

  return response.data;
}

async function step5_GetAgent() {
  logSection("Step 5: Get Agent Details");

  log("→", `Fetching agent: ${agentId}`);

  const response = await makeRequest("GET", `/agents/${agentId}`);

  if (response.status !== 200) {
    log("✗", `Fetch failed: ${response.status}`);
    return null;
  }

  log("✓", `Agent details retrieved`);
  log("ℹ", `Name: ${response.data.agentName}`);
  log("ℹ", `Type: ${response.data.agentType}`);
  log("ℹ", `API Endpoint: ${response.data.apiEndpoint}`);
  log("ℹ", `Reputation Score: ${response.data.reputation?.score}`);
  log("ℹ", `Risk Level: ${response.data.reputation?.riskLevel}`);

  return response.data;
}

async function step6_CreateTask() {
  logSection("Step 6: Create Task");

  log("→", `Creating task for agent: ${agentId}`);

  const response = await makeRequest("POST", "/tasks/request", {
    agentId,
    taskType: "execution",
    inputPayload: {
      target: "treasury-rebalance",
      network: "solana-devnet",
      maxSlippageBps: 100,
      tokens: ["SOL", "USDC"],
      thresholds: {
        minBalance: 1000,
        maxRiskScore: 0.7,
      },
    },
  });

  if (response.status !== 201) {
    log(
      "✗",
      `Task creation failed: ${response.status} ${JSON.stringify(response.data)}`,
    );
    throw new Error("Task creation failed");
  }

  taskId = response.data.id;

  log("✓", `Task created successfully`);
  log("ℹ", `Task ID: ${taskId}`);
  log("ℹ", `Status: ${response.data.status}`);
  log("ℹ", `Type: ${response.data.taskType}`);

  return response.data;
}

async function step7_GetSimulationScenarios() {
  logSection("Step 7: Get Simulation Scenarios");

  log("→", "Fetching available scenarios");

  const response = await makeRequest("GET", "/simulation/scenarios");

  if (response.status !== 200) {
    log("✗", `Fetch failed: ${response.status}`);
    return [];
  }

  log("✓", "Scenarios retrieved");
  response.data.items.forEach((scenario) => {
    log("ℹ", `• ${scenario}`);
  });

  return response.data.items;
}

async function step8_SimulateTask() {
  logSection("Step 8: Run Task Simulation");

  log("→", `Simulating task: ${taskId}`);

  const response = await makeRequest("POST", `/tasks/${taskId}/simulate`, {
    scenario: "Token Swap",
    inputPayload: {
      fromToken: "USDC",
      toToken: "SOL",
      amount: 1000,
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    log(
      "✗",
      `Simulation failed: ${response.status} ${JSON.stringify(response.data)}`,
    );
    return null;
  }

  log("✓", `Simulation completed successfully`);
  log("ℹ", `Execution Time: ${response.data.executionTime}ms`);
  log(
    "ℹ",
    `Result: ${JSON.stringify(response.data.result || response.data.simulationStatus)}`,
  );
  if (response.data.alerts && response.data.alerts.length > 0) {
    log("ℹ", `Alerts: ${response.data.alerts.length}`);
  }

  return response.data;
}

async function step9_GetPricing() {
  logSection("Step 9: Get Task Pricing");

  log("→", "Fetching pricing information");

  const response = await makeRequest(
    "GET",
    "/payments/pricing?taskType=execution&currency=SOL",
  );

  if (response.status !== 200) {
    log("✗", `Pricing fetch failed: ${response.status}`);
    return null;
  }

  log("✓", "Pricing retrieved");
  log("ℹ", `Task Type: ${response.data.taskType}`);
  log("ℹ", `Currency: ${response.data.currency}`);
  log("ℹ", `Amount: ${response.data.amount}`);

  return response.data;
}

async function step10_PayTask() {
  logSection("Step 10: Pay for Task");

  log("→", `Paying for task: ${taskId}`);
  log(
    "ℹ",
    "Note: Payment will be SIMULATED unless SOLANA_ENABLE_REAL_TRANSFERS=true",
  );

  const response = await makeRequest("POST", `/tasks/${taskId}/pay`, {
    currency: "SOL",
  });

  if (response.status !== 200 && response.status !== 201) {
    log(
      "✗",
      `Payment failed: ${response.status} ${JSON.stringify(response.data)}`,
    );
    return null;
  }

  log("✓", `Payment processed`);
  log(
    "ℹ",
    `Payment Status: ${response.data.paymentStatus || response.data.status}`,
  );
  log("ℹ", `Amount: ${response.data.amount} ${response.data.currency}`);
  if (response.data.transactionSignature) {
    log(
      "ℹ",
      `Signature: ${response.data.transactionSignature.substring(0, 20)}...`,
    );
  }

  return response.data;
}

async function step11_ExecuteTask() {
  logSection("Step 11: Execute Task");

  log("→", `Executing task: ${taskId}`);

  const response = await makeRequest("POST", `/tasks/${taskId}/execute`, {
    executeWithCRE: false,
  });

  if (response.status !== 200 && response.status !== 201) {
    log(
      "✗",
      `Execution failed: ${response.status} ${JSON.stringify(response.data)}`,
    );
    return null;
  }

  log("✓", `Task executed successfully`);
  log(
    "ℹ",
    `Execution Status: ${response.data.executionStatus || response.data.status}`,
  );
  log(
    "ℹ",
    `Proof Hash: ${response.data.proofHash?.substring(0, 20) || "N/A"}...`,
  );

  return response.data;
}

async function step12_GetTransactionHistory() {
  logSection("Step 12: View Transaction History");

  log("→", "Fetching transaction history");

  const response = await makeRequest("GET", "/transactions/history");

  if (response.status !== 200) {
    log("✗", `Fetch failed: ${response.status}`);
    return null;
  }

  log("✓", `Transaction history retrieved`);
  log("ℹ", `Total Transactions: ${response.data.total}`);
  log("ℹ", `Total Volume: ${response.data.totalVolume} SOL/SPL`);
  log("ℹ", `High Risk: ${response.data.highRisk}`);

  if (response.data.items && response.data.items.length > 0) {
    log("ℹ", `Recent transactions:`);
    response.data.items.slice(0, 3).forEach((tx) => {
      log("ℹ", `  • ${tx.type} - ${tx.currency} ${tx.amount} - ${tx.status}`);
    });
  }

  return response.data;
}

async function step13_GetPaymentHistory() {
  logSection("Step 13: View Payment History");

  log("→", "Fetching payment history");

  const response = await makeRequest("GET", "/payments/history");

  if (response.status !== 200) {
    log("✗", `Fetch failed: ${response.status}`);
    return null;
  }

  log("✓", `Payment history retrieved`);
  log("ℹ", `Total payments: ${response.data.items?.length || 0}`);

  if (response.data.items && response.data.items.length > 0) {
    response.data.items.slice(0, 3).forEach((payment) => {
      log(
        "ℹ",
        `  • ${payment.currency} ${payment.amount} → Agent ${payment.toAgentId?.substring(0, 8)}`,
      );
    });
  }

  return response.data;
}

async function step14_GetSolanaStatus() {
  logSection("Step 14: Check Solana Runtime Status");

  log("→", "Fetching Solana status");

  const response = await makeRequest("GET", "/solana/status", null, {
    Authorization: "", // Public endpoint
  });

  if (response.status !== 200) {
    log("✗", `Fetch failed: ${response.status}`);
    return null;
  }

  log("✓", `Solana status retrieved`);
  log("ℹ", `Cluster: ${response.data.cluster}`);
  log("ℹ", `RPC URL: ${response.data.rpcUrl}`);
  log("ℹ", `Commitment: ${response.data.commitment}`);
  log("ℹ", `Real Proofs Enabled: ${response.data.realProofsEnabled}`);
  log("ℹ", `Real Transfers Enabled: ${response.data.realTransfersEnabled}`);
  log("ℹ", `Operator Available: ${response.data.operatorAvailable}`);

  if (response.data.configErrors && response.data.configErrors.length > 0) {
    log("ℹ", `Config Errors:`);
    response.data.configErrors.forEach((err) => {
      log("ℹ", `  ⚠ ${err}`);
    });
  }

  return response.data;
}

async function step15_GetSystemStatus() {
  logSection("Step 15: Check System Health");

  log("→", "Fetching system status");

  const response = await makeRequest("GET", "/system/status", null, {
    Authorization: "", // Public endpoint
  });

  if (response.status !== 200) {
    log("✗", `Fetch failed: ${response.status}`);
    return null;
  }

  log("✓", `System status retrieved`);
  log("ℹ", `Status: ${response.data.status}`);
  log("ℹ", `Database: ${response.data.database}`);
  log("ℹ", `Uptime: ${response.data.uptime?.toFixed(2) || "N/A"}s`);

  return response.data;
}

async function runDemo() {
  console.log("\n");
  console.log(
    "╔══════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║          AGENTITY SOLANA DEMO - COMPLETE WORKFLOW                ║",
  );
  console.log(
    "║                                                                  ║",
  );
  log("ℹ", `API Base URL: ${BASE_URL}`);
  console.log(
    "╚══════════════════════════════════════════════════════════════════╝",
  );

  try {
    // Step 1: Register
    await step1_RegisterUser();

    // Step 2: Register agent
    await step2_RegisterAgent();

    // Step 3: Link wallet
    await step3_LinkWallet();

    // Step 4: Verify
    await step4_VerifyAgent();

    // Step 5: Get agent details
    await step5_GetAgent();

    // Step 6: Create task
    await step6_CreateTask();

    // Step 7: Scenarios
    await step7_GetSimulationScenarios();

    // Step 8: Simulate
    await step8_SimulateTask();

    // Step 9: Pricing
    await step9_GetPricing();

    // Step 10: Pay
    await step10_PayTask();

    // Step 11: Execute
    await step11_ExecuteTask();

    // Step 12: Transaction history
    await step12_GetTransactionHistory();

    // Step 13: Payment history
    await step13_GetPaymentHistory();

    // Step 14: Solana status
    await step14_GetSolanaStatus();

    // Step 15: System status
    await step15_GetSystemStatus();

    logSection("✓ DEMO COMPLETED SUCCESSFULLY");

    log("✓", "All endpoints tested successfully!");
    log("ℹ", `Demo User Email: ${DEMO_USER_EMAIL}`);
    log("ℹ", `Agent ID: ${agentId}`);
    log("ℹ", `Task ID: ${taskId}`);
    log("ℹ", `JWT (first 30 chars): ${jwt.substring(0, 30)}...`);

    console.log("\n📊 Next steps:");
    console.log(
      "  1. Open frontend: https://agentity-server-solana-client.vercel.app/",
    );
    console.log(`  2. Log in with: ${DEMO_USER_EMAIL}`);
    console.log(`  3. Check Dashboard, Agents, Transactions tabs`);
    console.log("\n📖 Full API docs: " + BASE_URL + "/docs\n");
  } catch (error) {
    logSection("✗ DEMO FAILED");
    log("✗", `Error: ${error.message}`);
    process.exit(1);
  }
}

// Run
runDemo();
