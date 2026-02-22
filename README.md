# IntentForge

> **Programmable Digital Rupee — Intent-Bound Money for Everyone**

IntentForge transforms the Digital Rupee from passive digital cash into user-programmable, intent-driven money. Non-technical users define spending rules in plain English, enforce them automatically on every transaction in real time, and recover misused funds via automated clawback — without writing code or involving a bank.

Built for the **Programmable Digital Rupee** track.

---

## The Problem

The Digital Rupee supports Purpose-Bound Money, but today's implementations are bank-controlled or restricted to government subsidy use cases. Individuals and small businesses have no way to define trust-based spending rules — like restricting a loan to education, capping a daily limit for a family member, or blocking gambling transactions entirely.

Programmable money remains an institutional privilege. IntentForge changes that.

---

## What It Does

| Capability | How |
|---|---|
| Define spending rules in plain English | AI Copilot parses natural language into structured policies |
| Voice commands | Web Speech API — speak rules aloud |
| Real-time transaction enforcement | FastAPI validation engine, <100ms per transaction |
| Block/approve by category, merchant, amount, location, time | Deterministic rule engine |
| Auto-recover misused funds | Clawback service + 30s Auto-Protect polling toggle |
| Geo-locked funds | GPS city detection → ISO 3166-2:IN state code validation |
| Time-locked funds | Policy expiry enforced on-chain and off-chain |
| UPI payment simulation | Realistic VPA handles, 18-digit NPCI ref IDs |
| On-chain enforcement | Solidity contract — no intermediary, no discretion |
| Audit trail | Blockchain event reader for IntentCreated / IntentClaimed |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React 19 Frontend                        │
│                                                                 │
│  Landing → Dashboard → IntentRules → Transactions → AI         │
│  RuleBuilder → BlockchainAudit → Settings                      │
│                                                                 │
│  Role-based: Lender (Account 0) vs Receiver (Account 1)        │
└────────────────┬────────────────────────┬───────────────────────┘
                 │ REST  /api/v1           │ ethers.js v6
                 ▼                         ▼
┌───────────────────────────┐   ┌──────────────────────────────┐
│     FastAPI Backend       │   │    Hardhat Local Node        │
│     Python 3.13           │   │    localhost:8545            │
│                           │   │                              │
│  ValidationService        │   │  IntentForge.sol             │
│  PolicyService            │   │  ├── createIntent()          │
│  ClawbackService          │   │  ├── claimIntent()           │
│  WalletService            │   │  ├── getUserRules()          │
│  AIService                │   │  ├── getRule()               │
│  ComplianceMLService      │   │  ├── getRuleStatus()         │
│  BlockchainAuditService   │   │  ├── event IntentCreated     │
│  ExplanationGenerator     │   │  └── event IntentClaimed     │
│  IntentParserService      │   │                              │
│  MLModelService           │   │  Express.js REST Wrapper     │
│  StressTestService        │   │  localhost:3001              │
└───────────────────────────┘   └──────────────────────────────┘
```

---

## Demo Flow

### Setup

| Role | MetaMask Account | What they can do |
|---|---|---|
| **Lender** | Hardhat Account #0 | Create rules, deploy intents, monitor compliance, clawback |
| **Receiver** | Hardhat Account #1 | View rules addressed to them, claim eligible funds |

**MetaMask network:** `localhost:8545` · Chain ID `31337`

### Walkthrough

1. Connect MetaMask as **Lender** → land on Intent Rules page
2. Go to **Rule Builder** → type "Block gambling above 5000 rupees" → AI parses → one-click deploy
3. Or use **Voice Input** → speak the rule → same flow
4. Switch MetaMask to **Receiver** → see the rules deployed against their address
5. Go to **Transactions** → **Standard tab** → simulate a gambling transaction → see live BLOCKED decision in <100ms
6. Switch to **UPI tab** → choose Dream11 → enter amount → generate ref ID → see UPI receipt with decision
7. Back on Dashboard → enable **Auto-Protect** → it polls every 30s and auto-clawbacks any violations
8. Go to **Blockchain Audit** → see IntentCreated and IntentClaimed events read directly from the contract

---

## Feature Reference

### Rule Builder
- Visual form: tap-to-select categories, amount inputs, expiry presets (5 min / 1h / 12h / 1 day / 7 days)
- 6 one-click templates: Daily Spending Cap, Block Gambling, Night Lock, Merchant Whitelist, Savings Vault, Per-Transaction Cap
- AI Copilot: natural language → structured policy with confidence score
- Voice input: Web Speech API, stale-closure-safe via `useRef`
- Deploy to smart contract with one button

### Validation Engine (`POST /api/v1/transaction/validate`)
- Category restriction checks
- Amount limit (total + per-transaction cap)
- Merchant whitelist / blacklist
- Geo-fence: ISO 3166-2:IN state codes (IN-MH, IN-DL, IN-KA, IN-TS, IN-TN, IN-WB, IN-GJ)
- Expiry timestamp validation
- Returns: `APPROVED` / `BLOCKED` / `VIOLATION` + AI reasoning + policies evaluated count + processing time

### Clawback Engine
- Manual clawback from UI on any approved transaction
- **Auto-Protect toggle**: polls every 30s, detects BLOCKED/VIOLATION transactions, fires clawback automatically, shows live "X secured" counter
- 5 clawback reasons: POLICY_VIOLATION, EXPIRED_POLICY, FRAUD_DETECTION, COMPLIANCE_BREACH, MANUAL_REVERSAL
- Atomic balance restoration

### UPI Simulator
- 4 VPA presets: `rahul@paytm`, `priya@phonepe`, `amit@okicici`, `neha@ybl`
- 6 merchants: Swiggy, Zomato, Amazon, Flipkart, BookMyShow, Dream11
- Auto-generated 18-digit NPCI-format UPI Ref ID (epoch timestamp + random suffix)
- Routes through the same validation engine
- Receipt-style result: To / From / Amount / Ref ID / Decision

### Transaction Simulator (Standard)
- 25+ merchant presets across 12 categories
- GPS auto-detect: browser geolocation → nearest city via Euclidean distance
- City → ISO 3166-2:IN state code mapping (8 cities)
- Shows ISO code sent to backend under the dropdown

### Blockchain Audit
- Reads `IntentCreated` and `IntentClaimed` events directly from contract (not the backend)
- Derives live statistics: total policies, transactions, approved, blocked, violations, clawbacks
- Event list with timestamp, type badge, hash
- Falls back to demo data when no wallet connected

### AI Layer
- Chat panel with keyword-matched offline fallback (navigation guidance when backend offline)
- Anomaly detection: amount spike, velocity, rejection rate, late-night pattern
- Role-aware suggestions: Lenders see rule recommendations; Receivers see claim alerts (no Create/Block actions)
- Compliance score: 0→100 gauge, color-coded by risk tier

### Lender / Receiver Architecture
- Wallet address mapped to role via `config/roles.js`
- Lender-only routes: Rule Builder, AI Insights, Blockchain Audit (enforced in `App.js`)
- Receiver: on-chain query via `contract.filters.IntentCreated(null, null, receiverAddress)` — sees only rules addressed to them
- Both: shared Transactions page, Dashboard (role-themed BalanceHero, distinct gradients)

---

## API Reference

**Base URL:** `http://localhost:8000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/wallet/create` | Create wallet |
| `GET` | `/wallet/{id}/balance` | Get balance |
| `POST` | `/wallet/{id}/attach-policy` | Attach policy to wallet |
| `POST` | `/policy/create` | Create spending policy |
| `GET` | `/policy/wallet/{id}` | Get wallet's active policies |
| `GET` | `/policy/conflicts` | Detect policy conflicts |
| `PUT` | `/policy/{id}/update` | Update policy |
| `DELETE` | `/policy/{id}` | Delete policy |
| `POST` | `/transaction/validate` | Validate transaction (main endpoint) |
| `GET` | `/transaction/wallet/{id}/history` | Transaction history |
| `POST` | `/clawback/execute` | Execute clawback |
| `GET` | `/clawback/history` | Clawback history |
| `POST` | `/ai/parse-intent` | NLP → policy |
| `GET` | `/ai/suggestions/{wallet_id}` | AI policy suggestions |
| `GET` | `/metrics/compliance` | Compliance score (ML) |
| `GET` | `/metrics/wallet/{id}/risk-analysis` | Risk analysis |
| `POST` | `/metrics/stress-test` | Load test the validation engine |
| `GET` | `/metrics/blockchain/audit-log` | Audit log |

---

## Smart Contract

**`IntentForge.sol`** — Solidity ^0.8.20 · OpenZeppelin ^5.0.0

```solidity
// Lender locks ETH with a receiver and expiry
function createIntent(address _receiver, uint256 _expiry) external payable

// Receiver claims locked ETH (validates expiry, access control)
function claimIntent(bytes32 ruleId) external

// View functions
function getUserRules(address user) external view returns (bytes32[] memory)
function getRule(bytes32 ruleId) external view returns (address, address, uint256, uint256, bool)
function getRuleStatus(bytes32 ruleId) external view returns (string memory)

// Events
event IntentCreated(bytes32 indexed ruleId, address indexed sender, address indexed receiver, uint256 amount, uint256 expiry)
event IntentClaimed(bytes32 indexed ruleId, address indexed receiver, uint256 amount)
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 19 |
| Animations | Framer Motion | 12 |
| Routing | React Router | v7 |
| Styling | Tailwind CSS | 3 |
| Charts | Recharts | latest |
| Icons | Lucide React | latest |
| Fonts | Space Grotesk · DM Sans · JetBrains Mono | — |
| Wallet | MetaMask + ethers.js | v6.9.0 |
| Smart contracts | Solidity + Hardhat | ^0.8.20 / 2.19.0 |
| Contract library | OpenZeppelin Contracts | ^5.0.0 |
| Blockchain server | Express.js | ^4.18.2 |
| Backend framework | FastAPI | 0.109.0 |
| Backend runtime | Python | 3.13 |
| Data validation | Pydantic | v2.5.3 |
| ASGI server | Uvicorn | 0.27.0 |
| Voice input | Web Speech API | browser-native |
| Container orchestration | Docker Compose | — |
| Node.js | — | 22.x |

---

## Project Structure

```
IntentForge/                         # Repo root
├── src/                             # React frontend
│   ├── pages/                       # 8 pages
│   │   ├── Dashboard.jsx            # Wallet overview, trust score, auto-protect
│   │   ├── IntentRules.jsx          # On-chain rule management (lender/receiver split)
│   │   ├── RuleBuilderPage.jsx      # AI Copilot + voice rule creation
│   │   ├── Transactions.jsx         # History, simulator (Standard + UPI tabs)
│   │   ├── BlockchainAudit.jsx      # On-chain event explorer
│   │   ├── AIInsights.jsx           # Anomaly feed, compliance chart, voice
│   │   ├── Settings.jsx             # User preferences
│   │   └── Landing.jsx              # Public landing
│   ├── components/
│   │   ├── ai/                      # ChatPanel, CopilotOrb, InsightsPanel, VoiceInput
│   │   ├── dashboard/               # AutoProtectToggle
│   │   ├── intent/                  # LenderDashboard, ReceiverDashboard, CreateRuleForm, RuleCard
│   │   ├── transactions/            # TransactionSimulator, UPISimulator, LiveFeed, TransactionCard
│   │   ├── wallet/                  # BalanceHero, TrustScoreGauge, SpendingChart, QuickStats
│   │   ├── rules/                   # RuleBuilder, TemplateSelector, CategoryPicker, AmountInput
│   │   ├── layout/                  # Sidebar, Header, MobileNav
│   │   ├── shared/                  # GlassCard, AnimatedButton, StatusBadge, LoadingSkeleton
│   │   └── demo/                    # DemoModeToggle, AutoPlayDemo
│   ├── services/                    # API service layer (7 modules)
│   ├── hooks/                       # useWallet, useTransactions, useCompliance, useWeb3
│   ├── config/                      # api.js, contracts.js, roles.js
│   └── utils/                       # constants.js, formatters.js, animations.js, colors.js
├── backend/
│   └── app/
│       ├── routes/                  # transaction, policy, wallet, clawback, ai, metrics, health
│       ├── services/                # 11 service modules
│       ├── models/                  # Pydantic data models
│       └── utils/                   # exceptions.py, logger.py
├── blockchain/
│   ├── contracts/                   # IntentForge.sol, IntentForgeAudit.sol
│   ├── server/                      # Express REST wrapper (port 3001)
│   ├── scripts/                     # deploy.js, deploy-intent.js
│   └── test/                        # Contract tests
├── docker-compose.yml
├── package.json                     # Frontend + workspace scripts
├── requirements.txt                 # Python backend dependencies
└── README.md
```

---

## Setup

### Quick Start (all services)

```bash
# From repo root
npm run dev
```

This runs frontend + backend + blockchain node concurrently.

### Manual Setup

**1. Hardhat node + blockchain server** (two terminals)
```bash
npm run hardhat          # Terminal 1 — starts Hardhat node on localhost:8545
npm run blockchain       # Terminal 2 — starts Express REST server on :3001
```

**2. Backend**
```bash
pip install -r requirements.txt
npm run backend          # runs: cd backend && uvicorn app.main:app --reload --port 8000
```

**3. Frontend**
```bash
npm install
npm start                # starts on localhost:3000
```

### Docker

```bash
docker-compose up --build
```

| Service | Port | Description |
|---|---|---|
| frontend | 3000 | React app |
| backend | 8000 | FastAPI + all services |
| blockchain | 3001 / 8545 | Express REST + Hardhat node |

### MetaMask Configuration

1. Add network: **RPC URL** `http://localhost:8545` · **Chain ID** `31337` · **Currency** ETH
2. Import private key for Lender (Account #0): `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. Import private key for Receiver (Account #1): `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

> These are Hardhat's default well-known test keys. Never use them on any real network.

---

## Environment Variables

### Backend (`backend/.env`)

```env
APP_NAME=IntentForge Backend
APP_VERSION=1.0.0
ENVIRONMENT=development
DEBUG=True
HOST=0.0.0.0
PORT=8000
API_V1_PREFIX=/api/v1
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
SECRET_KEY=intentforge-dev-secret-nxtgen-2025
DB_MOCK=True
AI_TIMEOUT_MS=100
ML_CONFIDENCE_THRESHOLD=0.75
MAX_TRANSACTION_AMOUNT=1000000.0
VALIDATION_TIMEOUT_MS=50
CLAWBACK_WINDOW_HOURS=24
AUTO_CLAWBACK_ENABLED=True
BLOCKCHAIN_API_URL=http://localhost:3001/api/v1/blockchain
LOG_LEVEL=INFO
```

### Blockchain (`blockchain/.env`)

```env
NETWORK=localhost
RPC_URL=http://127.0.0.1:8545
PORT=3001
API_PREFIX=/api/v1
GAS_LIMIT=3000000
GAS_PRICE=auto
```

---

## Challenge Alignment

| Requirement | Coverage | Implementation |
|---|---|---|
| No-code intent builder | **Complete** | Visual template picker + AI Copilot (NLP) + voice input |
| Real-time verification engine | **Complete** | FastAPI `ValidationService` — category / amount / merchant / geo / expiry checks |
| Automated clawbacks for misused funds | **Complete** | `ClawbackService` + `AutoProtectToggle` (30s polling) |
| Time-based release conditions | **Complete** | Policy `expiry` field enforced on-chain (`claimIntent`) and off-chain (validator) |
| Geo-based release conditions | **Complete** | ISO 3166-2:IN codes, GPS city auto-detect, geo-fence validation |
| UPI integration | **Demo-level** | Full UPI payment simulator with VPA, 18-digit ref IDs, receipt UI |
| Trust without institutions | **Complete** | On-chain `createIntent` / `claimIntent` — enforcement at EVM level |
| User empowerment | **Excellent** | Voice, templates, AI copilot, plain-language feedback, mobile-first |

### Novelties

- AI Copilot with NLP intent parsing and confidence scoring
- Voice command input (Web Speech API)
- Auto-Protect: autonomous 30s violation detector + clawback trigger
- Dual role architecture (Lender / Receiver) enforced at contract level
- On-chain audit explorer reading events directly from Hardhat node
- ML-backed compliance scoring with anomaly detection
- UPI payment rail simulation with realistic NPCI ref IDs
- GPS-to-ISO-state-code location resolution
- ETH → INR display layer (₹ primary, ETH secondary)
- Demo mode + AutoPlay demo for presentation
- Role-themed dashboards with distinct visual identities
- Stress testing service for validation engine load testing
