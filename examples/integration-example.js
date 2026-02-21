/**
 * IntentForge Blockchain Integration Example
 * 
 * This file demonstrates how Member 2 (Core Backend) should integrate
 * with the blockchain audit layer.
 * 
 * Copy this pattern into your FastAPI/Node.js backend.
 */

const axios = require('axios');

// Configuration
const BLOCKCHAIN_API_BASE = 'http://localhost:3001/api/v1/blockchain';

/**
 * Blockchain Integration Service
 * Wrapper around blockchain API calls for clean integration
 */
class BlockchainIntegration {
  
  /**
   * Example 1: Policy Registration
   * Call this when a user creates a new wallet with programmable rules
   */
  async registerWalletPolicy(walletId, userId, rules) {
    console.log(`📝 Registering policy for wallet ${walletId}...`);
    
    try {
      const response = await axios.post(`${BLOCKCHAIN_API_BASE}/policy/register`, {
        walletId: walletId,
        policy: {
          userId: userId,
          rules: rules,
          version: '1.0.0',
          createdAt: new Date().toISOString()
        }
      });
      
      console.log('✅ Policy registered on blockchain');
      console.log('   Transaction Hash:', response.data.transactionHash);
      console.log('   Policy Hash:', response.data.policyHash);
      
      // Store policy hash in your database for verification
      await this.savePolicyHashToDatabase(walletId, response.data.policyHash);
      
      return {
        success: true,
        policyHash: response.data.policyHash,
        transactionHash: response.data.transactionHash
      };
      
    } catch (error) {
      console.error('❌ Policy registration failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
  
  /**
   * Example 2: Transaction Validation Logging
   * Call this AFTER your backend validates a transaction
   */
  async logTransactionDecision(walletId, transactionId, validationResult, policy) {
    console.log(`📊 Logging transaction ${transactionId}...`);
    
    // Map your validation result to blockchain decision
    let decision;
    if (validationResult.approved) {
      decision = 'APPROVED';
    } else if (validationResult.policyViolation) {
      decision = 'VIOLATION';
    } else {
      decision = 'BLOCKED';
    }
    
    try {
      const response = await axios.post(`${BLOCKCHAIN_API_BASE}/transaction/log`, {
        walletId: walletId,
        txId: transactionId,
        decision: decision,
        policy: policy
      });
      
      console.log(`✅ Transaction logged as ${decision}`);
      console.log('   Transaction Hash:', response.data.transactionHash);
      
      return {
        success: true,
        transactionHash: response.data.transactionHash
      };
      
    } catch (error) {
      console.error('❌ Transaction logging failed:', error.response?.data || error.message);
      // Non-critical: Don't fail the transaction if logging fails
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
  
  /**
   * Example 3: Violation Recording
   * Call this when ML model or rule engine detects policy violation
   */
  async recordPolicyViolation(transactionId, violationDetails) {
    console.log(`⚠️  Recording violation for transaction ${transactionId}...`);
    
    try {
      const response = await axios.post(`${BLOCKCHAIN_API_BASE}/violation/log`, {
        txId: transactionId,
        reason: violationDetails.reason,
        penalty: violationDetails.penaltyApplied
      });
      
      console.log('✅ Violation recorded on blockchain');
      console.log('   Transaction Hash:', response.data.transactionHash);
      console.log('   Reason Hash:', response.data.reasonHash);
      
      // Trigger penalty enforcement in your system
      await this.applyPenalty(transactionId, violationDetails.penaltyApplied);
      
      return {
        success: true,
        transactionHash: response.data.transactionHash,
        reasonHash: response.data.reasonHash
      };
      
    } catch (error) {
      console.error('❌ Violation recording failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
  
  /**
   * Example 4: Clawback Logging
   * Call this when you execute a transaction reversal
   */
  async logTransactionClawback(originalTxId, clawbackTxId, reason) {
    console.log(`🔄 Logging clawback for transaction ${originalTxId}...`);
    
    try {
      const response = await axios.post(`${BLOCKCHAIN_API_BASE}/clawback/log`, {
        originalTxId: originalTxId,
        clawbackTxId: clawbackTxId,
        reason: reason
      });
      
      console.log('✅ Clawback logged on blockchain');
      console.log('   Transaction Hash:', response.data.transactionHash);
      
      return {
        success: true,
        transactionHash: response.data.transactionHash
      };
      
    } catch (error) {
      console.error('❌ Clawback logging failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
  
  /**
   * Example 5: Audit Trail Retrieval
   * Get complete audit trail for compliance reporting
   */
  async getAuditTrail(walletId) {
    console.log(`📋 Fetching audit trail for wallet ${walletId}...`);
    
    try {
      // Get policy
      const policyResponse = await axios.get(`${BLOCKCHAIN_API_BASE}/policy/${walletId}`);
      
      // Get statistics
      const statsResponse = await axios.get(`${BLOCKCHAIN_API_BASE}/statistics`);
      
      console.log('✅ Audit trail retrieved');
      
      return {
        success: true,
        policy: policyResponse.data.policy,
        statistics: statsResponse.data.statistics
      };
      
    } catch (error) {
      console.error('❌ Audit trail retrieval failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
  
  /**
   * Example 6: Health Check
   * Verify blockchain connectivity before processing
   */
  async checkBlockchainHealth() {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API_BASE}/health`);
      return response.data.healthy;
    } catch (error) {
      console.error('⚠️  Blockchain health check failed:', error.message);
      return false;
    }
  }
  
  /**
   * Mock database operations (implement these in your actual backend)
   */
  async savePolicyHashToDatabase(walletId, policyHash) {
    // TODO: Implement in your database
    console.log(`   Saving policy hash to database: ${walletId} -> ${policyHash}`);
  }
  
  async applyPenalty(transactionId, penalty) {
    // TODO: Implement penalty enforcement
    console.log(`   Applying penalty: ${penalty}`);
  }
}

// ============================================
// INTEGRATION WORKFLOW EXAMPLES
// ============================================

/**
 * Workflow 1: User Creates Wallet with Rules
 */
async function onUserWalletCreation(userId, walletId) {
  const blockchain = new BlockchainIntegration();
  
  // Check blockchain connectivity
  const isHealthy = await blockchain.checkBlockchainHealth();
  if (!isHealthy) {
    console.warn('⚠️  Blockchain service unavailable, policy will be registered later');
    // Queue for retry or handle gracefully
    return;
  }
  
  // Define policy rules (from your UI/rule builder)
  const rules = [
    {
      type: 'daily_limit',
      amount: 50000,
      currency: 'INR'
    },
    {
      type: 'merchant_category_block',
      categories: ['gambling', 'alcohol', 'tobacco']
    },
    {
      type: 'velocity_check',
      maxTransactionsPerHour: 5
    }
  ];
  
  // Register policy on blockchain
  const result = await blockchain.registerWalletPolicy(walletId, userId, rules);
  
  if (result.success) {
    console.log('🎉 Wallet created with blockchain-backed policy');
  } else {
    console.error('Failed to register policy on blockchain');
  }
}

/**
 * Workflow 2: Transaction Validation & Logging
 */
async function processTransaction(walletId, transaction) {
  const blockchain = new BlockchainIntegration();
  
  // Step 1: Load wallet policy from your database
  const policy = await loadWalletPolicy(walletId);
  
  // Step 2: Validate transaction against policy (your existing logic)
  const validationResult = await validateTransactionAgainstPolicy(transaction, policy);
  
  // Step 3: Log decision on blockchain
  await blockchain.logTransactionDecision(
    walletId,
    transaction.id,
    validationResult,
    policy
  );
  
  // Step 4: If violation, record it
  if (validationResult.policyViolation) {
    await blockchain.recordPolicyViolation(transaction.id, {
      reason: validationResult.violationReason,
      penaltyApplied: validationResult.penalty
    });
  }
  
  // Step 5: Execute or block transaction based on result
  if (validationResult.approved) {
    await executeTransaction(transaction);
  } else {
    await blockTransaction(transaction);
  }
}

/**
 * Workflow 3: Fraud Detection & Clawback
 */
async function handleFraudDetection(originalTransaction) {
  const blockchain = new BlockchainIntegration();
  
  // Step 1: ML model detects fraud (your AI logic)
  const fraudScore = await mlFraudDetectionModel(originalTransaction);
  
  if (fraudScore > 0.85) {
    console.log('🚨 High fraud probability detected!');
    
    // Step 2: Execute transaction reversal (your business logic)
    const clawbackTransaction = await executeTransactionReversal(originalTransaction);
    
    // Step 3: Log clawback on blockchain
    await blockchain.logTransactionClawback(
      originalTransaction.id,
      clawbackTransaction.id,
      `ML fraud detection score: ${fraudScore.toFixed(2)} - Automated reversal`
    );
    
    // Step 4: Record violation
    await blockchain.recordPolicyViolation(originalTransaction.id, {
      reason: 'Fraudulent transaction detected by ML compliance model',
      penaltyApplied: 'Account under review, transaction reversed'
    });
  }
}

/**
 * Workflow 4: Compliance Reporting
 */
async function generateComplianceReport(walletId, startDate, endDate) {
  const blockchain = new BlockchainIntegration();
  
  // Get audit trail from blockchain
const auditTrail = await blockchain.getAuditTrail(walletId);
  
  if (auditTrail.success) {
    // Generate report combining your database data and blockchain audit trail
    const report = {
      walletId: walletId,
      period: { startDate, endDate },
      policy: auditTrail.policy,
      blockchainStatistics: auditTrail.statistics,
      // Add your transaction data here
    };
    
    console.log('📊 Compliance report generated');
    return report;
  }
}

// ============================================
// MOCK HELPER FUNCTIONS
// (Implement these in your actual backend)
// ============================================

async function loadWalletPolicy(walletId) {
  // TODO: Load from your database
  return {
    rules: [{ type: 'daily_limit', amount: 50000 }],
    version: '1.0.0'
  };
}

async function validateTransactionAgainstPolicy(transaction, policy) {
  // TODO: Your existing validation logic
  return {
    approved: true,
    policyViolation: false,
    violationReason: null,
    penalty: null
  };
}

async function executeTransaction(transaction) {
  // TODO: Your transaction execution logic
  console.log('💰 Transaction executed:', transaction.id);
}

async function blockTransaction(transaction) {
  // TODO: Your transaction blocking logic
  console.log('🚫 Transaction blocked:', transaction.id);
}

async function mlFraudDetectionModel(transaction) {
  // TODO: Your ML model inference
  return Math.random(); // Mock fraud score
}

async function executeTransactionReversal(transaction) {
  // TODO: Your reversal logic
  return {
    id: `CLAWBACK_${transaction.id}`,
    originalTxId: transaction.id
  };
}

// ============================================
// USAGE EXAMPLE
// ============================================

async function main() {
  console.log('🚀 IntentForge Blockchain Integration Example\n');
  
  // Simulate workflow
  console.log('1️⃣  Creating user wallet with policy...');
  await onUserWalletCreation('USER_123', 'WALLET_123');
  
  console.log('\n2️⃣  Processing transaction...');
  await processTransaction('WALLET_123', {
    id: 'TX_123',
    amount: 1000,
    merchant: 'GROCERY_STORE'
  });
  
  console.log('\n✅ Integration example complete!');
}

// Uncomment to run example
// main().catch(console.error);

module.exports = BlockchainIntegration;
