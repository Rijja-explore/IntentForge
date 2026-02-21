# IntentForge Blockchain - Setup Guide

## Prerequisites

- Node.js v18+ and npm
- Git

## Installation Steps

### 1. Clone and Install

```bash
cd "d:\Projects\Intentforge - blockchain backend"
npm install
```

This will install:

- Hardhat (Ethereum development environment)
- OpenZeppelin Contracts (Security-audited smart contracts)
- Ethers.js v6 (Ethereum library)
- Express (REST API framework)
- Testing libraries (Chai, Mocha)

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

The default configuration works for local development. No changes needed for initial setup.

### 3. Compile Smart Contracts

```bash
npm run compile
```

This compiles the IntentForgeAudit Solidity contract and generates:

- Contract ABI in `artifacts/`
- TypeScript types in `typechain-types/`

### 4. Start Local Blockchain

In a **separate terminal**, start the Hardhat local node:

```bash
npm run node
```

This starts a local Ethereum node at `http://127.0.0.1:8545` with:

- 10 funded accounts (10,000 ETH each)
- Deterministic account addresses
- Fast block mining

**Keep this terminal running!**

### 5. Deploy Contract

In your **main terminal**:

```bash
npm run deploy:local
```

This will:

1. Deploy IntentForgeAudit contract
2. Display contract address
3. Show account configuration

**Important**: Copy the deployed **contract address** from the output.

### 6. Update Environment

Edit `.env` and add the contract address:

```env
CONTRACT_ADDRESS=0x... # Paste the deployed contract address here
```

### 7. Run Tests

```bash
npm test
```

Expected output:

```
  IntentForgeAudit - Financial Integrity Infrastructure
    ✓ Should set the correct owner
    ✓ Should register a new policy
    ✓ Should log a transaction
    ... (40+ passing tests)
```

### 8. Start API Server

```bash
npm start
```

The API server will start at `http://localhost:3001`.

---

## Account Architecture

| Account Index | Role                 | Address (Hardhat Default)                  |
| ------------- | -------------------- | ------------------------------------------ |
| 0             | System Admin / Owner | 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 |
| 1             | Backend Service      | 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 |
| 2             | Compliance Auditor   | 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC |
| 3             | Mock User Wallet A   | 0x90F79bf6EB2c4f870365E785982E1f101E93b906 |
| 4             | Mock User Wallet B   | 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 |

**Backend Service Account (Account[1])** is pre-configured in `.env.example`.

---

## Quick Start Commands

```bash
# Terminal 1: Start local blockchain
npm run node

# Terminal 2: Development workflow
npm run compile          # Compile contracts
npm run deploy:local     # Deploy to local node
npm test                 # Run test suite
npm start                # Start API server
```

---

## Testing the API

Once the server is running, test with curl:

### Register a Policy

```bash
curl -X POST http://localhost:3001/api/v1/blockchain/policy/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "WALLET_TEST_001",
    "policy": {
      "rules": [
        {"type": "daily_limit", "amount": 50000}
      ],
      "version": "1.0.0"
    }
  }'
```

### Log a Transaction

```bash
curl -X POST http://localhost:3001/api/v1/blockchain/transaction/log \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "WALLET_TEST_001",
    "txId": "TX_TEST_001",
    "decision": "APPROVED",
    "policy": {
      "rules": [{"type": "daily_limit", "amount": 50000}],
      "version": "1.0.0"
    }
  }'
```

### Get Statistics

```bash
curl http://localhost:3001/api/v1/blockchain/statistics
```

---

## Troubleshooting

### Port Already in Use

If port 8545 is already in use:

```bash
# Windows
netstat -ano | findstr :8545
taskkill /PID <PID> /F

# Or change the port in hardhat.config.js
```

### Contract Not Deployed

If you see "CONTRACT_ADDRESS not configured":

1. Ensure local node is running (`npm run node`)
2. Deploy contract (`npm run deploy:local`)
3. Copy contract address to `.env`

### Tests Failing

```bash
# Clean and recompile
npm run compile

# Restart local node
# (Stop with Ctrl+C, then npm run node again)

# Re-run tests
npm test
```

---

## Project Structure

```
intentforge-blockchain-backend/
├── contracts/           # Solidity smart contracts
│   └── IntentForgeAudit.sol
├── scripts/            # Deployment scripts
│   └── deploy.js
├── test/               # Smart contract tests
│   └── IntentForgeAudit.test.js
├── src/                # API service layer
│   ├── server.js       # Express server
│   ├── routes/         # API route handlers
│   └── services/       # Blockchain service wrapper
├── docs/               # Documentation
│   └── API.md
├── hardhat.config.js   # Hardhat configuration
└── package.json        # Dependencies and scripts
```

---

## Next Steps

1. ✅ Complete local setup and testing
2. ✅ Integrate with Member 2 backend
3. 📄 Optional: Deploy to testnet (Sepolia, Goerli)
4. 📊 Optional: Set up event monitoring
5. 🔐 Optional: Add API key authentication

---

## Support

For issues or questions:

- Check contract source code: `contracts/IntentForgeAudit.sol`
- Review API documentation: `docs/API.md`
- Run tests for examples: `npm test`
