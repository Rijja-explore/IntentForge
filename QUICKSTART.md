# 🚀 IntentForge Blockchain - Quick Start Checklist

## Pre-Demo Setup (Do Once)

### ☐ Step 1: Install Dependencies
```bash
cd "d:\Projects\Intentforge - blockchain backend"
npm install
```
**Expected**: 400+ packages installed

---

### ☐ Step 2: Compile Contracts
```bash
npm run compile
```
**Expected**: `Compiled 3 Solidity files successfully`

---

### ☐ Step 3: Run Tests
```bash
npm test
```
**Expected**: `42 passing (2s)`

---

## Demo Day Workflow

### ☐ Terminal 1: Start Blockchain Node

```bash
cd "d:\Projects\Intentforge - blockchain backend"
npm run node
```

**Expected output**:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd... (10000 ETH)
Account #1: 0x70997... (10000 ETH)
...
```

**⚠️ Keep this terminal running during entire demo!**

---

### ☐ Terminal 2: Deploy Contract

```bash
cd "d:\Projects\Intentforge - blockchain backend"
npm run deploy:local
```

**Expected output**:
```
✅ IntentForgeAudit deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**📝 Copy the contract address!**

---

### ☐ Step 5: Update .env File

Edit `.env`:
```env
CONTRACT_ADDRESS=0x5FbDB2... # Paste the address from deployment
```

---

### ☐ Terminal 2: Start API Server

```bash
npm start
```

**Expected output**:
```
🚀 Server running on http://localhost:3001
📡 API Base URL: http://localhost:3001/api/v1
✅ Ready to receive requests
```

---

## Quick Health Check

### ☐ Test API Health

```bash
curl http://localhost:3001/health
```

**Expected**:
```json
{
  "success": true,
  "service": "IntentForge Blockchain Backend",
  "version": "1.0.0"
}
```

---

### ☐ Test Blockchain Health

```bash
curl http://localhost:3001/api/v1/blockchain/health
```

**Expected**:
```json
{
  "success": true,
  "healthy": true,
  "contractAddress": "0x5FbDB2...",
  "backendAccount": "0x70997..."
}
```

---

## Demo Scenarios

### Scenario 1: Register Policy

```bash
curl -X POST http://localhost:3001/api/v1/blockchain/policy/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "DEMO_WALLET_001",
    "policy": {
      "rules": [
        {"type": "daily_limit", "amount": 50000},
        {"type": "merchant_whitelist", "merchants": ["GROCERY", "PHARMACY"]}
      ],
      "version": "1.0.0"
    }
  }'
```

**Expected**: Success with `transactionHash` and `policyHash`

---

### Scenario 2: Log Approved Transaction

```bash
curl -X POST http://localhost:3001/api/v1/blockchain/transaction/log \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "DEMO_WALLET_001",
    "txId": "TX_DEMO_001",
    "decision": "APPROVED",
    "policy": {
      "rules": [{"type": "daily_limit", "amount": 50000}],
      "version": "1.0.0"
    }
  }'
```

**Expected**: Success with `transactionHash`

---

### Scenario 3: Record Violation

```bash
curl -X POST http://localhost:3001/api/v1/blockchain/violation/log \
  -H "Content-Type: application/json" \
  -d '{
    "txId": "TX_VIOLATION_001",
    "reason": "Exceeded daily transaction limit of 50000 INR",
    "penalty": "Account temporarily suspended for 24 hours"
  }'
```

**Expected**: Success with `transactionHash` and `reasonHash`

---

### Scenario 4: Log Clawback

```bash
curl -X POST http://localhost:3001/api/v1/blockchain/clawback/log \
  -H "Content-Type: application/json" \
  -d '{
    "originalTxId": "TX_FRAUD_001",
    "clawbackTxId": "CLAWBACK_001",
    "reason": "Fraudulent transaction detected by ML compliance model"
  }'
```

**Expected**: Success with `transactionHash` and `reasonHash`

---

### Scenario 5: Get Statistics

```bash
curl http://localhost:3001/api/v1/blockchain/statistics
```

**Expected**:
```json
{
  "success": true,
  "statistics": {
    "totalPolicies": 1,
    "totalTransactionsLogged": 1,
    "totalViolations": 1,
    "totalClawbacks": 1
  }
}
```

---

## Troubleshooting

### ❌ "Cannot connect to blockchain"

**Solution**: Ensure Terminal 1 (blockchain node) is running
```bash
npm run node
```

---

### ❌ "CONTRACT_ADDRESS not configured"

**Solution**: Update `.env` with deployed contract address
```bash
npm run deploy:local  # Get new address
# Edit .env and add CONTRACT_ADDRESS=0x...
```

---

### ❌ Port 3001 already in use

**Solution**: Change port in `.env`
```env
PORT=3002
```

---

### ❌ Port 8545 already in use

**Windows**:
```powershell
netstat -ano | findstr :8545
taskkill /PID <PID> /F
```

---

## Judge Demo Talking Points

### 🎯 Point 1: Financial Governance, Not DeFi

> "This isn't a cryptocurrency token. It's a **financial integrity infrastructure** for programmable Digital Rupee. Think of it as a tamper-proof audit log for compliance."

---

### 🎯 Point 2: Separation of Concerns

> "The blockchain doesn't handle business logic. It's purely for **immutable record-keeping**. Our backend validates transactions, and blockchain provides the **audit trail**."

---

### 🎯 Point 3: Production Architecture

> "Notice the **role-based access control**, **gas optimization**, and **comprehensive test coverage**. We've built 42 unit tests covering all critical paths."

---

### 🎯 Point 4: Hash-Based Privacy

> "Sensitive data isn't stored on-chain. We hash policy details and violation reasons using **keccak256**. This ensures **privacy** while maintaining **verifiability**."

---

### 🎯 Point 5: Integration Simplicity

> "Our backend team (Member 2) doesn't need to understand blockchain. They just make **HTTP API calls**. We handle all the complexity - transaction signing, gas management, error handling."

---

## Post-Demo Cleanup

### ☐ Stop Blockchain Node
Press `Ctrl+C` in Terminal 1

---

### ☐ Stop API Server
Press `Ctrl+C` in Terminal 2

---

### ☐ Optional: Clean Build Artifacts
```bash
rm -rf artifacts cache
```

---

## Quick Reference

**Blockchain Node**: `npm run node`  
**Deploy Contract**: `npm run deploy:local`  
**Start API**: `npm start`  
**Run Tests**: `npm test`

**API Base**: `http://localhost:3001/api/v1`

---

## ✅ Demo Readiness Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Tests passing (`npm test` → 42 passing)
- [ ] Blockchain node running (Terminal 1)
- [ ] Contract deployed (copy address)
- [ ] `.env` updated with contract address
- [ ] API server running (Terminal 2)
- [ ] Health checks passing
- [ ] Demo scenarios tested

**All checked?** → **🎉 READY FOR DEMO!** 🎉

---

## Emergency Contacts

**Documentation**:
- Full docs: `docs/SUMMARY.md`
- API reference: `docs/API.md`
- Setup guide: `docs/SETUP.md`

**Tests**: All 42 tests in `test/IntentForgeAudit.test.js`

**Contract**: Source in `contracts/IntentForgeAudit.sol`

---

**Good luck! 🚀**
