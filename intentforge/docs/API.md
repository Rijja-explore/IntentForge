# IntentForge Blockchain API Documentation

## Overview

The IntentForge Blockchain API provides tamper-proof audit logging for programmable Digital Rupee transactions. This is a **Financial Integrity Infrastructure**, not a DeFi system.

**Base URL**: `http://localhost:3001/api/v1`

---

## Authentication

All blockchain operations are executed using the configured backend service account. No additional authentication is required for API calls, but ensure your `.env` file is properly configured.

---

## API Endpoints

### Health Check

#### GET /blockchain/health

Check blockchain service connectivity and status.

**Response:**

```json
{
  "success": true,
  "healthy": true,
  "contractAddress": "0x...",
  "backendAccount": "0x..."
}
```

---

### Policy Management

#### POST /blockchain/policy/register

Register a new programmable money policy on-chain.

**Request Body:**

```json
{
  "walletId": "WALLET_001",
  "policy": {
    "rules": [
      {
        "type": "daily_limit",
        "amount": 50000,
        "currency": "INR"
      },
      {
        "type": "merchant_whitelist",
        "merchants": ["MERCHANT_001", "MERCHANT_002"]
      }
    ],
    "version": "1.0.0"
  }
}
```

**Response:**

```json
{
  "success": true,
  "transactionHash": "0x...",
  "policyHash": "0x...",
  "blockNumber": 12345,
  "gasUsed": "150000"
}
```

---

#### GET /blockchain/policy/:walletId

Retrieve policy details for a specific wallet.

**Path Parameters:**

- `walletId` (string): Wallet identifier

**Response:**

```json
{
  "success": true,
  "policy": {
    "walletId": "WALLET_001",
    "policyHash": "0x...",
    "timestamp": 1708518000,
    "deployedBy": "0x...",
    "isActive": true
  }
}
```

---

### Transaction Logging

#### POST /blockchain/transaction/log

Log a transaction validation decision on-chain.

**Request Body:**

```json
{
  "walletId": "WALLET_001",
  "txId": "TX_001",
  "decision": "APPROVED",
  "policy": {
    "rules": [...],
    "version": "1.0.0"
  }
}
```

**Decision Values:**

- `APPROVED` - Transaction passed all policy checks
- `BLOCKED` - Transaction violated policy rules
- `VIOLATION` - Compliance violation detected

**Response:**

```json
{
  "success": true,
  "transactionHash": "0x...",
  "blockNumber": 12346,
  "gasUsed": "120000"
}
```

---

#### GET /blockchain/transaction/:txId

Retrieve transaction log details.

**Path Parameters:**

- `txId` (string): Transaction identifier

**Response:**

```json
{
  "success": true,
  "log": {
    "walletId": "WALLET_001",
    "txId": "TX_001",
    "decision": "APPROVED",
    "policyHash": "0x...",
    "timestamp": 1708518100,
    "loggedBy": "0x..."
  }
}
```

---

### Violation Recording

#### POST /blockchain/violation/log

Record a compliance violation on-chain.

**Request Body:**

```json
{
  "txId": "TX_VIOLATION_001",
  "reason": "Exceeded daily transaction limit of 50000 INR",
  "penalty": "Account suspended for 24 hours"
}
```

**Response:**

```json
{
  "success": true,
  "transactionHash": "0x...",
  "reasonHash": "0x...",
  "blockNumber": 12347,
  "gasUsed": "110000"
}
```

---

#### GET /blockchain/violation/:txId

Retrieve violation record details.

**Path Parameters:**

- `txId` (string): Transaction identifier

**Response:**

```json
{
  "success": true,
  "violation": {
    "txId": "TX_VIOLATION_001",
    "reasonHash": "0x...",
    "penaltyApplied": "Account suspended for 24 hours",
    "timestamp": 1708518200,
    "recordedBy": "0x..."
  }
}
```

---

### Clawback Logging

#### POST /blockchain/clawback/log

Log a transaction reversal (clawback) execution.

**Request Body:**

```json
{
  "originalTxId": "TX_FRAUD_001",
  "clawbackTxId": "CLAWBACK_001",
  "reason": "Fraudulent transaction detected by ML compliance model"
}
```

**Response:**

```json
{
  "success": true,
  "transactionHash": "0x...",
  "reasonHash": "0x...",
  "blockNumber": 12348,
  "gasUsed": "105000"
}
```

---

### Statistics

#### GET /blockchain/statistics

Get aggregate contract statistics.

**Response:**

```json
{
  "success": true,
  "statistics": {
    "totalPolicies": 150,
    "totalTransactionsLogged": 5234,
    "totalViolations": 42,
    "totalClawbacks": 8
  }
}
```

---

## Error Responses

All endpoints return standardized error responses:

**400 Bad Request:**

```json
{
  "success": false,
  "error": "walletId and policy are required"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "error": "Policy not found for this wallet"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Transaction already logged"
}
```

---

## Integration Example

### Node.js Backend Integration

```javascript
const axios = require("axios");

const BLOCKCHAIN_API = "http://localhost:3001/api/v1/blockchain";

// Register a policy
async function registerPolicy(walletId, policyRules) {
  try {
    const response = await axios.post(`${BLOCKCHAIN_API}/policy/register`, {
      walletId: walletId,
      policy: {
        rules: policyRules,
        version: "1.0.0",
      },
    });

    console.log("Policy registered:", response.data.policyHash);
    return response.data;
  } catch (error) {
    console.error("Policy registration failed:", error.response?.data);
    throw error;
  }
}

// Log a transaction
async function logTransaction(walletId, txId, decision, policy) {
  try {
    const response = await axios.post(`${BLOCKCHAIN_API}/transaction/log`, {
      walletId,
      txId,
      decision,
      policy,
    });

    console.log("Transaction logged:", response.data.transactionHash);
    return response.data;
  } catch (error) {
    console.error("Transaction logging failed:", error.response?.data);
    throw error;
  }
}

// Record a violation
async function recordViolation(txId, reason, penalty) {
  try {
    const response = await axios.post(`${BLOCKCHAIN_API}/violation/log`, {
      txId,
      reason,
      penalty,
    });

    console.log("Violation recorded:", response.data.transactionHash);
    return response.data;
  } catch (error) {
    console.error("Violation recording failed:", error.response?.data);
    throw error;
  }
}
```

---

## Data Integrity

All sensitive data is hashed before being stored on-chain:

- **Policy Hash**: `keccak256(JSON.stringify(policy))`
- **Reason Hash**: `keccak256(reason_string)`

This ensures:

- Privacy - Raw data is not exposed on-chain
- Integrity - Any tampering is detectable
- Verification - Original data can be verified against hash

---

## Gas Optimization

The contract is optimized for minimal gas usage:

| Operation           | Estimated Gas |
| ------------------- | ------------- |
| Policy Registration | ~150,000      |
| Transaction Logging | ~120,000      |
| Violation Recording | ~110,000      |
| Clawback Logging    | ~105,000      |

---

## Event Subscriptions

For real-time audit monitoring, subscribe to contract events:

### PolicyRegistered

```javascript
contract.on(
  "PolicyRegistered",
  (walletId, policyHash, timestamp, deployedBy) => {
    console.log("New policy registered:", walletId);
  },
);
```

### TransactionLogged

```javascript
contract.on(
  "TransactionLogged",
  (walletId, txId, decision, policyHash, timestamp) => {
    console.log("Transaction logged:", txId, "Decision:", decision);
  },
);
```

### ViolationRecorded

```javascript
contract.on("ViolationRecorded", (txId, reasonHash, penalty, timestamp) => {
  console.log("Violation recorded:", txId);
});
```

### ClawbackExecuted

```javascript
contract.on(
  "ClawbackExecuted",
  (originalTxId, clawbackTxId, reasonHash, timestamp) => {
    console.log("Clawback executed:", clawbackTxId);
  },
);
```

---

## Support

For integration support or questions, refer to the main README or contract source code.
