const express = require("express");
const BlockchainService = require("../services/blockchainService");

const router = express.Router();
let blockchainService;

// Initialize blockchain service
async function initBlockchainService() {
  if (!blockchainService) {
    blockchainService = new BlockchainService();
    await blockchainService.initialize();
  }
  return blockchainService;
}

/**
 * POST /api/v1/blockchain/policy/register
 * Register a new policy on-chain
 */
router.post("/policy/register", async (req, res) => {
  try {
    const { walletId, policy } = req.body;

    if (!walletId || !policy) {
      return res.status(400).json({
        success: false,
        error: "walletId and policy are required"
      });
    }

    const service = await initBlockchainService();
    const result = await service.registerPolicy(walletId, policy);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/blockchain/policy/:walletId
 * Get policy details for a wallet
 */
router.get("/policy/:walletId", async (req, res) => {
  try {
    const { walletId } = req.params;

    const service = await initBlockchainService();
    const result = await service.getPolicy(walletId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/blockchain/transaction/log
 * Log a transaction validation decision
 */
router.post("/transaction/log", async (req, res) => {
  try {
    const { walletId, txId, decision, policy } = req.body;

    if (!walletId || !txId || !decision || !policy) {
      return res.status(400).json({
        success: false,
        error: "walletId, txId, decision, and policy are required"
      });
    }

    if (!["APPROVED", "BLOCKED", "VIOLATION"].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: "decision must be APPROVED, BLOCKED, or VIOLATION"
      });
    }

    const service = await initBlockchainService();
    const result = await service.logTransaction(walletId, txId, decision, policy);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/blockchain/transaction/:txId
 * Get transaction log details
 */
router.get("/transaction/:txId", async (req, res) => {
  try {
    const { txId } = req.params;

    const service = await initBlockchainService();
    const result = await service.getTransactionLog(txId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/blockchain/violation/log
 * Record a compliance violation
 */
router.post("/violation/log", async (req, res) => {
  try {
    const { txId, reason, penalty } = req.body;

    if (!txId || !reason || !penalty) {
      return res.status(400).json({
        success: false,
        error: "txId, reason, and penalty are required"
      });
    }

    const service = await initBlockchainService();
    const result = await service.recordViolation(txId, reason, penalty);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/blockchain/violation/:txId
 * Get violation record details
 */
router.get("/violation/:txId", async (req, res) => {
  try {
    const { txId } = req.params;

    const service = await initBlockchainService();
    const result = await service.getViolationRecord(txId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/blockchain/clawback/log
 * Log a clawback execution
 */
router.post("/clawback/log", async (req, res) => {
  try {
    const { originalTxId, clawbackTxId, reason } = req.body;

    if (!originalTxId || !clawbackTxId || !reason) {
      return res.status(400).json({
        success: false,
        error: "originalTxId, clawbackTxId, and reason are required"
      });
    }

    const service = await initBlockchainService();
    const result = await service.logClawback(originalTxId, clawbackTxId, reason);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/blockchain/statistics
 * Get contract statistics
 */
router.get("/statistics", async (req, res) => {
  try {
    const service = await initBlockchainService();
    const result = await service.getStatistics();

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/blockchain/health
 * Health check endpoint
 */
router.get("/health", async (req, res) => {
  try {
    const service = await initBlockchainService();
    const isConnected = service.provider !== null;
    
    res.status(200).json({
      success: true,
      healthy: isConnected,
      contractAddress: service.contractAddress,
      backendAccount: service.backendSigner?.address
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      healthy: false,
      error: error.message
    });
  }
});

module.exports = router;
