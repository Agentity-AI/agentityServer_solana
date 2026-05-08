const winston = require("winston");

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "apiKey",
  "accessToken",
  "refreshToken",
  "privateKey",
  "secretKey",
  "seedPhrase",
  "mnemonic",
  "DATABASE_URL",
  "SOLANA_OPERATOR_KEYPAIR_JSON",
  "SOLANA_OPERATOR_SECRET_KEY",
  "SOLANA_OPERATOR_PRIVATE_KEY",
]);

function redactValue(value) {
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, innerValue]) => {
        if (SENSITIVE_KEYS.has(key)) {
          return [key, "[REDACTED]"];
        }

        return [key, redactValue(innerValue)];
      }),
    );
  }

  return value;
}

const redactSecrets = winston.format((info) => redactValue(info))();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: {
    service: "agentity-solana-backend",
    env: process.env.NODE_ENV || "development",
  },
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    redactSecrets,
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
