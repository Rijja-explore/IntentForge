const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IntentForgeAudit - Financial Integrity Infrastructure", function () {
  let intentForgeAudit;
  let owner; // System Admin
  let backendService; // Backend Service Account
  let auditor; // Compliance Auditor
  let walletA; // Mock User Wallet A
  let walletB; // Mock User Wallet B

  beforeEach(async function () {
    // Get signers
    [owner, backendService, auditor, walletA, walletB] = await ethers.getSigners();

    // Deploy contract
    const IntentForgeAudit = await ethers.getContractFactory("IntentForgeAudit");
    intentForgeAudit = await IntentForgeAudit.deploy(backendService.address);
    await intentForgeAudit.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await intentForgeAudit.owner()).to.equal(owner.address);
    });

    it("Should set the correct backend service account", async function () {
      expect(await intentForgeAudit.backendServiceAccount()).to.equal(backendService.address);
    });

    it("Should have correct version", async function () {
      expect(await intentForgeAudit.VERSION()).to.equal("1.0.0");
    });

    it("Should initialize counters to zero", async function () {
      expect(await intentForgeAudit.totalPolicies()).to.equal(0);
      expect(await intentForgeAudit.totalTransactionsLogged()).to.equal(0);
      expect(await intentForgeAudit.totalViolations()).to.equal(0);
      expect(await intentForgeAudit.totalClawbacks()).to.equal(0);
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to update backend service account", async function () {
      await expect(
        intentForgeAudit.connect(owner).updateBackendServiceAccount(auditor.address)
      )
        .to.emit(intentForgeAudit, "BackendServiceAccountUpdated")
        .withArgs(backendService.address, auditor.address);

      expect(await intentForgeAudit.backendServiceAccount()).to.equal(auditor.address);
    });

    it("Should reject unauthorized backend service account update", async function () {
      await expect(
        intentForgeAudit.connect(backendService).updateBackendServiceAccount(auditor.address)
      ).to.be.reverted;
    });

    it("Should reject zero address for backend service account", async function () {
      await expect(
        intentForgeAudit.connect(owner).updateBackendServiceAccount(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Policy Registration", function () {
    const walletId = "WALLET_001";
    const policyHash = ethers.keccak256(ethers.toUtf8Bytes("policy_v1"));

    it("Should register a new policy", async function () {
      await expect(
        intentForgeAudit.connect(backendService).registerPolicy(walletId, policyHash)
      )
        .to.emit(intentForgeAudit, "PolicyRegistered")
        .withArgs(walletId, policyHash, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1), backendService.address);

      expect(await intentForgeAudit.totalPolicies()).to.equal(1);
    });

    it("Should retrieve registered policy", async function () {
      await intentForgeAudit.connect(backendService).registerPolicy(walletId, policyHash);
      
      const policy = await intentForgeAudit.getPolicy(walletId);
      expect(policy.walletId).to.equal(walletId);
      expect(policy.policyHash).to.equal(policyHash);
      expect(policy.isActive).to.be.true;
      expect(policy.deployedBy).to.equal(backendService.address);
    });

    it("Should check if policy is active", async function () {
      await intentForgeAudit.connect(backendService).registerPolicy(walletId, policyHash);
      expect(await intentForgeAudit.isPolicyActive(walletId)).to.be.true;
    });

    it("Should reject policy registration from non-backend account", async function () {
      await expect(
        intentForgeAudit.connect(walletA).registerPolicy(walletId, policyHash)
      ).to.be.revertedWith("Unauthorized: Only backend service can call this function");
    });

    it("Should reject empty wallet ID", async function () {
      await expect(
        intentForgeAudit.connect(backendService).registerPolicy("", policyHash)
      ).to.be.revertedWith("Wallet ID cannot be empty");
    });

    it("Should reject zero policy hash", async function () {
      await expect(
        intentForgeAudit.connect(backendService).registerPolicy(walletId, ethers.ZeroHash)
      ).to.be.revertedWith("Policy hash cannot be zero");
    });

    it("Should reject duplicate policy registration", async function () {
      await intentForgeAudit.connect(backendService).registerPolicy(walletId, policyHash);
      
      await expect(
        intentForgeAudit.connect(backendService).registerPolicy(walletId, policyHash)
      ).to.be.revertedWith("Policy already registered for this wallet");
    });

    it("Should revert when getting non-existent policy", async function () {
      await expect(
        intentForgeAudit.getPolicy("NON_EXISTENT")
      ).to.be.revertedWith("Policy not found for this wallet");
    });
  });

  describe("Transaction Logging", function () {
    const walletId = "WALLET_001";
    const txId = "TX_001";
    const policyHash = ethers.keccak256(ethers.toUtf8Bytes("policy_v1"));
    const Decision = { APPROVED: 0, BLOCKED: 1, VIOLATION: 2 };

    it("Should log a transaction with APPROVED decision", async function () {
      await expect(
        intentForgeAudit.connect(backendService).logTransaction(walletId, txId, Decision.APPROVED, policyHash)
      )
        .to.emit(intentForgeAudit, "TransactionLogged")
        .withArgs(walletId, txId, Decision.APPROVED, policyHash, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      expect(await intentForgeAudit.totalTransactionsLogged()).to.equal(1);
    });

    it("Should log a transaction with BLOCKED decision", async function () {
      await intentForgeAudit.connect(backendService).logTransaction(walletId, txId, Decision.BLOCKED, policyHash);
      
      const log = await intentForgeAudit.getTransactionLog(txId);
      expect(log.decision).to.equal(Decision.BLOCKED);
    });

    it("Should log a transaction with VIOLATION decision", async function () {
      await intentForgeAudit.connect(backendService).logTransaction(walletId, txId, Decision.VIOLATION, policyHash);
      
      const log = await intentForgeAudit.getTransactionLog(txId);
      expect(log.decision).to.equal(Decision.VIOLATION);
    });

    it("Should retrieve transaction log details", async function () {
      await intentForgeAudit.connect(backendService).logTransaction(walletId, txId, Decision.APPROVED, policyHash);
      
      const log = await intentForgeAudit.getTransactionLog(txId);
      expect(log.walletId).to.equal(walletId);
      expect(log.txId).to.equal(txId);
      expect(log.policyHash).to.equal(policyHash);
      expect(log.loggedBy).to.equal(backendService.address);
    });

    it("Should reject transaction logging from non-backend account", async function () {
      await expect(
        intentForgeAudit.connect(walletA).logTransaction(walletId, txId, Decision.APPROVED, policyHash)
      ).to.be.revertedWith("Unauthorized: Only backend service can call this function");
    });

    it("Should reject empty wallet ID", async function () {
      await expect(
        intentForgeAudit.connect(backendService).logTransaction("", txId, Decision.APPROVED, policyHash)
      ).to.be.revertedWith("Wallet ID cannot be empty");
    });

    it("Should reject empty transaction ID", async function () {
      await expect(
        intentForgeAudit.connect(backendService).logTransaction(walletId, "", Decision.APPROVED, policyHash)
      ).to.be.revertedWith("Transaction ID cannot be empty");
    });

    it("Should reject zero policy hash", async function () {
      await expect(
        intentForgeAudit.connect(backendService).logTransaction(walletId, txId, Decision.APPROVED, ethers.ZeroHash)
      ).to.be.revertedWith("Policy hash cannot be zero");
    });

    it("Should reject duplicate transaction logging", async function () {
      await intentForgeAudit.connect(backendService).logTransaction(walletId, txId, Decision.APPROVED, policyHash);
      
      await expect(
        intentForgeAudit.connect(backendService).logTransaction(walletId, txId, Decision.APPROVED, policyHash)
      ).to.be.revertedWith("Transaction already logged");
    });

    it("Should revert when getting non-existent transaction log", async function () {
      await expect(
        intentForgeAudit.getTransactionLog("NON_EXISTENT")
      ).to.be.revertedWith("Transaction log not found");
    });
  });

  describe("Violation Recording", function () {
    const txId = "TX_VIOLATION_001";
    const reasonHash = ethers.keccak256(ethers.toUtf8Bytes("Exceeded daily limit"));
    const penalty = "Account suspended for 24 hours";

    it("Should record a violation", async function () {
      await expect(
        intentForgeAudit.connect(backendService).recordViolation(txId, reasonHash, penalty)
      )
        .to.emit(intentForgeAudit, "ViolationRecorded")
        .withArgs(txId, reasonHash, penalty, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      expect(await intentForgeAudit.totalViolations()).to.equal(1);
    });

    it("Should retrieve violation record details", async function () {
      await intentForgeAudit.connect(backendService).recordViolation(txId, reasonHash, penalty);
      
      const violation = await intentForgeAudit.getViolationRecord(txId);
      expect(violation.txId).to.equal(txId);
      expect(violation.reasonHash).to.equal(reasonHash);
      expect(violation.penaltyApplied).to.equal(penalty);
      expect(violation.recordedBy).to.equal(backendService.address);
    });

    it("Should reject violation recording from non-backend account", async function () {
      await expect(
        intentForgeAudit.connect(walletA).recordViolation(txId, reasonHash, penalty)
      ).to.be.revertedWith("Unauthorized: Only backend service can call this function");
    });

    it("Should reject empty transaction ID", async function () {
      await expect(
        intentForgeAudit.connect(backendService).recordViolation("", reasonHash, penalty)
      ).to.be.revertedWith("Transaction ID cannot be empty");
    });

    it("Should reject zero reason hash", async function () {
      await expect(
        intentForgeAudit.connect(backendService).recordViolation(txId, ethers.ZeroHash, penalty)
      ).to.be.revertedWith("Reason hash cannot be zero");
    });

    it("Should reject duplicate violation recording", async function () {
      await intentForgeAudit.connect(backendService).recordViolation(txId, reasonHash, penalty);
      
      await expect(
        intentForgeAudit.connect(backendService).recordViolation(txId, reasonHash, penalty)
      ).to.be.revertedWith("Violation already recorded for this transaction");
    });

    it("Should revert when getting non-existent violation record", async function () {
      await expect(
        intentForgeAudit.getViolationRecord("NON_EXISTENT")
      ).to.be.revertedWith("Violation record not found");
    });
  });

  describe("Clawback Logging", function () {
    const originalTxId = "TX_ORIGINAL_001";
    const clawbackTxId = "CLAWBACK_001";
    const reasonHash = ethers.keccak256(ethers.toUtf8Bytes("Fraudulent transaction detected"));

    it("Should log a clawback", async function () {
      await expect(
        intentForgeAudit.connect(backendService).logClawback(originalTxId, clawbackTxId, reasonHash)
      )
        .to.emit(intentForgeAudit, "ClawbackExecuted")
        .withArgs(originalTxId, clawbackTxId, reasonHash, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      expect(await intentForgeAudit.totalClawbacks()).to.equal(1);
    });

    it("Should retrieve clawback record details", async function () {
      await intentForgeAudit.connect(backendService).logClawback(originalTxId, clawbackTxId, reasonHash);
      
      const clawback = await intentForgeAudit.getClawbackRecord(clawbackTxId);
      expect(clawback.originalTxId).to.equal(originalTxId);
      expect(clawback.clawbackTxId).to.equal(clawbackTxId);
      expect(clawback.reasonHash).to.equal(reasonHash);
      expect(clawback.executedBy).to.equal(backendService.address);
    });

    it("Should reject clawback logging from non-backend account", async function () {
      await expect(
        intentForgeAudit.connect(walletA).logClawback(originalTxId, clawbackTxId, reasonHash)
      ).to.be.revertedWith("Unauthorized: Only backend service can call this function");
    });

    it("Should reject empty original transaction ID", async function () {
      await expect(
        intentForgeAudit.connect(backendService).logClawback("", clawbackTxId, reasonHash)
      ).to.be.revertedWith("Original transaction ID cannot be empty");
    });

    it("Should reject empty clawback transaction ID", async function () {
      await expect(
        intentForgeAudit.connect(backendService).logClawback(originalTxId, "", reasonHash)
      ).to.be.revertedWith("Clawback transaction ID cannot be empty");
    });

    it("Should reject zero reason hash", async function () {
      await expect(
        intentForgeAudit.connect(backendService).logClawback(originalTxId, clawbackTxId, ethers.ZeroHash)
      ).to.be.revertedWith("Reason hash cannot be zero");
    });

    it("Should reject duplicate clawback logging", async function () {
      await intentForgeAudit.connect(backendService).logClawback(originalTxId, clawbackTxId, reasonHash);
      
      await expect(
        intentForgeAudit.connect(backendService).logClawback(originalTxId, clawbackTxId, reasonHash)
      ).to.be.revertedWith("Clawback already logged");
    });

    it("Should revert when getting non-existent clawback record", async function () {
      await expect(
        intentForgeAudit.getClawbackRecord("NON_EXISTENT")
      ).to.be.revertedWith("Clawback record not found");
    });
  });

  describe("Integration Scenarios", function () {
    it("Should handle complete audit trail workflow", async function () {
      const walletId = "WALLET_CORP_001";
      const policyHash = ethers.keccak256(ethers.toUtf8Bytes("policy_corporate_v1"));
      const txId = "TX_CORP_001";
      const Decision = { APPROVED: 0, BLOCKED: 1, VIOLATION: 2 };

      // 1. Register policy
      await intentForgeAudit.connect(backendService).registerPolicy(walletId, policyHash);
      expect(await intentForgeAudit.totalPolicies()).to.equal(1);

      // 2. Log transaction
      await intentForgeAudit.connect(backendService).logTransaction(walletId, txId, Decision.APPROVED, policyHash);
      expect(await intentForgeAudit.totalTransactionsLogged()).to.equal(1);

      // 3. Verify audit trail
      const policy = await intentForgeAudit.getPolicy(walletId);
      const log = await intentForgeAudit.getTransactionLog(txId);
      
      expect(policy.policyHash).to.equal(log.policyHash);
    });

    it("Should handle violation and clawback scenario", async function () {
      const walletId = "WALLET_FRAUD_001";
      const txId = "TX_FRAUD_001";
      const policyHash = ethers.keccak256(ethers.toUtf8Bytes("policy_v1"));
      const reasonHash = ethers.keccak256(ethers.toUtf8Bytes("Fraud detected"));
      const clawbackTxId = "CLAWBACK_FRAUD_001";
      const Decision = { APPROVED: 0, BLOCKED: 1, VIOLATION: 2 };

      // 1. Log violation transaction
      await intentForgeAudit.connect(backendService).logTransaction(walletId, txId, Decision.VIOLATION, policyHash);
      
      // 2. Record violation
      await intentForgeAudit.connect(backendService).recordViolation(txId, reasonHash, "Account frozen");
      
      // 3. Log clawback
      await intentForgeAudit.connect(backendService).logClawback(txId, clawbackTxId, reasonHash);

      // 4. Verify counters
      expect(await intentForgeAudit.totalTransactionsLogged()).to.equal(1);
      expect(await intentForgeAudit.totalViolations()).to.equal(1);
      expect(await intentForgeAudit.totalClawbacks()).to.equal(1);
    });
  });
});
