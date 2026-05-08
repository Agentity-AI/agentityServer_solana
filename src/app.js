const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const logger = require("./config/logger");
const sequelize = require("./config/database");
const { optionalAuth } = require("./middleware/auth");

const agentRoutes = require("./routes/agents");
const simulationRoutes = require("./routes/simulation");
const executionRoutes = require("./routes/execution");
const dashboardRoutes = require("./routes/dashboard");
const authRoutes = require("./routes/auth");
const docsRoutes = require("./routes/docs");
const auditsRoutes = require("./routes/audits");
const walletRoutes = require("./routes/wallets");
const taskRoutes = require("./routes/tasks");
const paymentRoutes = require("./routes/payments");
const workflowRoutes = require("./routes/workflow");
const alertRoutes = require("./routes/alerts");
const transactionRoutes = require("./routes/transactions");
const systemRoutes = require("./routes/system");
const settingsRoutes = require("./routes/settings");
const integrationRoutes = require("./routes/integrations");
const solanaRoutes = require("./routes/solana");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  // "https://your-frontend-domain.com",
];

app.use(
  cors({
    origin(origin, cb) {
      // Non-browser clients often send no Origin header.
      if (!origin) {
        return cb(null, true);
      }

      // Allow explicitly trusted frontend origins.
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      // Temporary fallback.
      // Safer than using `origin: "*"`, but still permissive.
      return cb(null, true);

      // Recommended production version:
      // return cb(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

/**
 * Parse cookies into `req.cookies`.
 *
 * Why:
 * - Needed for cookie-based auth/session flows.
 */
app.use(cookieParser());

app.use(optionalAuth);

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info({
      message: "HTTP request completed",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      userId: req.user?.id || null,
    });
  });

  next();
});

/**
 * API route registration.
 */
app.use("/auth", authRoutes);
app.use("/agents", agentRoutes);
app.use("/simulation", simulationRoutes);
app.use("/execute", executionRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/docs", docsRoutes);
app.use("/audits", auditsRoutes);
app.use("/wallets", walletRoutes);
app.use("/tasks", taskRoutes);
app.use("/payments", paymentRoutes);
app.use("/workflow", workflowRoutes);
app.use("/alerts", alertRoutes);
app.use("/transactions", transactionRoutes);
app.use("/system", systemRoutes);
app.use("/settings", settingsRoutes);
app.use("/integrations", integrationRoutes);
app.use("/solana", solanaRoutes);

/**
 * Basic health endpoint.
 */
app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();

    return res.status(200).json({
      status: "healthy",
      database: "connected",
      uptime: process.uptime(),
    });
  } catch (error) {
    logger.error({
      message: "Database health check failed",
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });

    return res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

/**
 * 404 handler.
 */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/**
 * Global error handler.
 */
app.use((err, req, res, next) => {
  logger.error({
    message: "Unhandled application error",
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id || null,
    },
  });

  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
