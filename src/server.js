require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/database");
const logger = require("./config/logger");
const { buildSolanaRuntimeStatus } = require("./services/solana/client");

require("./models");

const rawPort = process.env.PORT || "5000";
const PORT = Number.parseInt(rawPort, 10);

if (Number.isNaN(PORT) || PORT <= 0) {
  throw new Error(`Invalid PORT: ${rawPort}`);
}

let server = null;
let shuttingDown = false;

function serializeError(error) {
  if (!error) {
    return null;
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    errno: error.errno,
    syscall: error.syscall,
    address: error.address,
    port: error.port,
    parent: error.parent
      ? {
          name: error.parent.name,
          message: error.parent.message,
          code: error.parent.code,
          errno: error.parent.errno,
          syscall: error.parent.syscall,
        }
      : null,
    original: error.original
      ? {
          name: error.original.name,
          message: error.original.message,
          code: error.original.code,
          errno: error.original.errno,
          syscall: error.original.syscall,
        }
      : null,
  };
}

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  logger.info({
    message: "Shutdown initiated",
    signal,
  });

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await sequelize.close();

    logger.info({ message: "Shutdown completed successfully" });
    process.exit(0);
  } catch (error) {
    logger.error({
      message: "Shutdown failed",
      error: serializeError(error),
    });
    process.exit(1);
  }
}

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info({ message: "Database connected successfully." });

    await sequelize.sync();
    logger.info({ message: "Database synced." });

    logger.info({
      message: "[solana] runtime configured",
      solana: buildSolanaRuntimeStatus(),
    });

    server = app.listen(PORT, () => {
      logger.info({
        message: "Server running",
        port: PORT,
        env: process.env.NODE_ENV || "development",
      });
    });

    server.on("error", (error) => {
      logger.error({
        message: "HTTP server failed",
        error: serializeError(error),
      });
      process.exit(1);
    });
  } catch (error) {
    logger.error({
      message: "Failed to start server",
      error: serializeError(error),
    });
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("uncaughtException", (error) => {
  logger.error({
    message: "Uncaught exception",
    error: serializeError(error),
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error({
    message: "Unhandled promise rejection",
    error:
      reason instanceof Error
        ? serializeError(reason)
        : {
            message:
              typeof reason === "string" ? reason : JSON.stringify(reason),
          },
  });
  process.exit(1);
});

void startServer();
