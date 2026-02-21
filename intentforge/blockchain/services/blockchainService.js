const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

/**
 * Blockchain Service Configuration
 * Manages contract interaction for IntentForge backend
 */
class BlockchainService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.backendSigner = null;
    this.contractAddress = process.env.CONTRACT_ADDRESS;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      // Connect to local Hardhat node or configured RPC
      const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Setup backend service signer
      const backendPrivateKey = process.env.BACKEND_SERVICE_PRIVATE_KEY;
      if (!backendPrivateKey) {
        throw new Error("BACKEND_SERVICE_PRIVATE_KEY not configured");
      }
      this.backendSigner = new ethers.Wallet(backendPrivateKey, this.provider);

      // Load contract
      if (!this.contractAddress) {
        throw new Error("CONTRACT_ADDRESS not configured");
      }

      const contractABI = require("../artifacts/contracts/IntentForgeAudit.sol/IntentForgeAudit.json").abi;
      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI,
        this.backendSigner
      );

      console.log("✅ Blockchain service initialized");
      console.log("├─ RPC URL:", rpcUrl);
      console.log("├─ Contract:", this.contractAddress);
      console.log("└─ Backend Account:", this.backendSigner.address);

      return true;
    } catch (error) {
      console.error("❌ Blockchain service initialization failed:", error.message);
      throw error;
    }
  }

  /**
   * Register a new policy on-chain
   * @param {string} walletId - Wallet identifier
   * @param {object} policyJson - Policy JSON object
   * @returns {object} Transaction receipt and policy hash
   */
  async registerPolicy(walletId, policyJson) {
    try {
      // Hash policy JSON
      const policyString = JSON.stringify(policyJson);
      const policyHash = ethers.keccak256(ethers.toUtf8Bytes(policyString));

      // Register on-chain
      const tx = await this.contract.registerPolicy(walletId, policyHash);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        policyHash: policyHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log a transaction validation decision
   * @param {string} walletId - Wallet identifier
   * @param {string} txId - Transaction identifier
   * @param {string} decision - APPROVED, BLOCKED, or VIOLATION
   * @param {object} policyJson - Policy used for validation
   * @returns {object} Transaction receipt
   */
  async logTransaction(walletId, txId, decision, policyJson) {
    try {
      const policyString = JSON.stringify(policyJson);
      const policyHash = ethers.keccak256(ethers.toUtf8Bytes(policyString));

      // Map decision string to enum
      const decisionEnum = {
        "APPROVED": 0,
        "BLOCKED": 1,
        "VIOLATION": 2
      }[decision];

      if (decisionEnum === undefined) {
        throw new Error("Invalid decision. Must be APPROVED, BLOCKED, or VIOLATION");
      }

      const tx = await this.contract.logTransaction(walletId, txId, decisionEnum, policyHash);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Record a compliance violation
   * @param {string} txId - Transaction identifier
   * @param {string} reason - Violation reason
   * @param {string} penalty - Penalty applied
   * @returns {object} Transaction receipt
   */
  async recordViolation(txId, reason, penalty) {
    try {
      const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(reason));

      const tx = await this.contract.recordViolation(txId, reasonHash, penalty);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        reasonHash: reasonHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log a clawback execution
   * @param {string} originalTxId - Original transaction ID
   * @param {string} clawbackTxId - Clawback transaction ID
   * @param {string} reason - Clawback reason
   * @returns {object} Transaction receipt
   */
  async logClawback(originalTxId, clawbackTxId, reason) {
    try {
      const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(reason));

      const tx = await this.contract.logClawback(originalTxId, clawbackTxId, reasonHash);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        reasonHash: reasonHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get policy details
   * @param {string} walletId - Wallet identifier
   * @returns {object} Policy details
   */
  async getPolicy(walletId) {
    try {
      const policy = await this.contract.getPolicy(walletId);
      return {
        success: true,
        policy: {
          walletId: policy.walletId,
          policyHash: policy.policyHash,
          timestamp: Number(policy.timestamp),
          deployedBy: policy.deployedBy,
          isActive: policy.isActive
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get transaction log details
   * @param {string} txId - Transaction identifier
   * @returns {object} Transaction log details
   */
  async getTransactionLog(txId) {
    try {
      const log = await this.contract.getTransactionLog(txId);
      const decisionMap = ["APPROVED", "BLOCKED", "VIOLATION"];
      
      return {
        success: true,
        log: {
          walletId: log.walletId,
          txId: log.txId,
          decision: decisionMap[log.decision],
          policyHash: log.policyHash,
          timestamp: Number(log.timestamp),
          loggedBy: log.loggedBy
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get violation record details
   * @param {string} txId - Transaction identifier
   * @returns {object} Violation details
   */
  async getViolationRecord(txId) {
    try {
      const violation = await this.contract.getViolationRecord(txId);
      return {
        success: true,
        violation: {
          txId: violation.txId,
          reasonHash: violation.reasonHash,
          penaltyApplied: violation.penaltyApplied,
          timestamp: Number(violation.timestamp),
          recordedBy: violation.recordedBy
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get clawback record details
   * @param {string} clawbackTxId - Clawback transaction identifier
   * @returns {object} Clawback details
   */
  async getClawbackRecord(clawbackTxId) {
    try {
      const clawback = await this.contract.getClawbackRecord(clawbackTxId);
      return {
        success: true,
        clawback: {
          originalTxId: clawback.originalTxId,
          clawbackTxId: clawback.clawbackTxId,
          reasonHash: clawback.reasonHash,
          timestamp: Number(clawback.timestamp),
          executedBy: clawback.executedBy
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get contract statistics
   * @returns {object} Contract statistics
   */
  async getStatistics() {
    try {
      const [totalPolicies, totalTx, totalViolations, totalClawbacks] = await Promise.all([
        this.contract.totalPolicies(),
        this.contract.totalTransactionsLogged(),
        this.contract.totalViolations(),
        this.contract.totalClawbacks()
      ]);

      return {
        success: true,
        statistics: {
          totalPolicies: Number(totalPolicies),
          totalTransactionsLogged: Number(totalTx),
          totalViolations: Number(totalViolations),
          totalClawbacks: Number(totalClawbacks)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = BlockchainService;
