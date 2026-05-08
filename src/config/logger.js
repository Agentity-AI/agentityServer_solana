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
    for (const [key, innerValue] of Object.entries(value)) {
      value[key] = SENSITIVE_KEYS.has(key) ? "[REDACTED]" : redactValue(innerValue);
    }

    return value;
  }

  return value;
}

const redactSecrets = winston.format((info) => {
  redactValue(info);
  return info;
})();

const developmentFormat = winston.format.printf((info) => {
  const { level, message, timestamp, service, env, ...meta } = info;
  const details = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";

  return `${level}: ${message}${details}`;
});

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: {
    service: "agentity-solana-backend",
    env: process.env.NODE_ENV || "development",
  },
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    redactSecrets,
    process.env.NODE_ENV === "production" ? productionFormat : developmentFormat,
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
