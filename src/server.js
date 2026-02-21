const express = require("express");
const cors = require("cors");
const blockchainRoutes = require("./routes/blockchainRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || "/api/v1";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "IntentForge Blockchain Backend",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use(`${API_PREFIX}/blockchain`, blockchainRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

// Start server
app.listen(PORT, () => {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   IntentForge - Blockchain Audit & Enforcement Layer      ║");
  console.log("║   Financial Integrity Infrastructure                       ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
  console.log();
  console.log("📚 Available Endpoints:");
  console.log(`├─ POST   ${API_PREFIX}/blockchain/policy/register`);
  console.log(`├─ GET    ${API_PREFIX}/blockchain/policy/:walletId`);
  console.log(`├─ POST   ${API_PREFIX}/blockchain/transaction/log`);
  console.log(`├─ GET    ${API_PREFIX}/blockchain/transaction/:txId`);
  console.log(`├─ POST   ${API_PREFIX}/blockchain/violation/log`);
  console.log(`├─ GET    ${API_PREFIX}/blockchain/violation/:txId`);
  console.log(`├─ POST   ${API_PREFIX}/blockchain/clawback/log`);
  console.log(`├─ GET    ${API_PREFIX}/blockchain/statistics`);
  console.log(`└─ GET    ${API_PREFIX}/blockchain/health`);
  console.log();
  console.log("⚙️  Configuration:");
  console.log(`├─ Network: ${process.env.NETWORK || "localhost"}`);
  console.log(`├─ RPC URL: ${process.env.RPC_URL || "http://127.0.0.1:8545"}`);
  console.log(`└─ Contract: ${process.env.CONTRACT_ADDRESS || "Not configured"}`);
  console.log();
  console.log("✅ Ready to receive requests");
  console.log("═══════════════════════════════════════════════════════════════");
});

module.exports = app;
