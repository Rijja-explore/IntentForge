# IntentForge - Blockchain Audit & Enforcement Layer

**Financial Integrity & Audit Infrastructure for Programmable Digital Rupee**

## 🎯 Purpose

This is NOT a DeFi token project. This is a **Financial Governance Backbone** that provides:

- ✅ Programmable money intent logging
- ✅ Rule deployment recording
- ✅ Violation tracking
- ✅ Tamper-proof policy hashes
- ✅ Transparent auditability
- ✅ Compliance verification

## 🏗 Architecture Role

**Member 3: Blockchain & Integrity Layer**

- Smart contracts for audit logging
- Hardhat local blockchain setup
- Hash-based policy storage
- Audit event storage
- Backend-accessible contract interaction layer

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Start Local Blockchain

```bash
npm run node
```

### Compile Contracts

```bash
npm run compile
```

### Deploy Contracts

```bash
npm run deploy:local
```

### Run Tests

```bash
npm test
```

### Start API Service

```bash
npm start
```

## 👥 Account Architecture

| Account    | Role               | Purpose                       |
| ---------- | ------------------ | ----------------------------- |
| Account[0] | System Admin       | Contract owner, deployment    |
| Account[1] | Backend Service    | Transaction logging authority |
| Account[2] | Compliance Auditor | Read-only audit access        |
| Account[3] | Mock User Wallet A | Testing                       |
| Account[4] | Mock User Wallet B | Testing                       |

## 📡 API Endpoints

### Policy Management

- `POST /api/v1/blockchain/policy/register` - Register new policy
- `GET /api/v1/blockchain/policy/:walletId` - Get policy by wallet ID

### Transaction Logging

- `POST /api/v1/blockchain/transaction/log` - Log transaction decision
- `GET /api/v1/blockchain/transaction/:txId` - Get transaction log

### Violation Recording

- `POST /api/v1/blockchain/violation/log` - Record violation
- `GET /api/v1/blockchain/violation/:txId` - Get violation details

### Clawback Logging

- `POST /api/v1/blockchain/clawback/log` - Log clawback execution

## 🔒 Security Features

- Role-based access control
- Backend service authentication
- Immutable audit logs
- Event-driven transparency
- Gas-optimized operations

## 📚 Development Standards

- Atomic commits
- Comprehensive testing
- Local-first development
- No external dependencies
- Production-grade code quality

## 🧪 Testing

All critical functions are tested:

- Policy registration
- Access control
- Transaction logging
- Violation recording
- Event emissions

## 📄 License

MIT
