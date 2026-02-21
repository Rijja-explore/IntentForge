# IntentForge

AI-powered programmable spending management platform with on-chain escrow enforcement.
Set natural-language intents, enforce them as on-chain policies, lock/claim ETH via smart contract, and get real-time ML compliance insights.

---

## Architecture

```
intentforge/
├── src/                     React 19 frontend (port 3000)
│   ├── components/
│   │   ├── ai/              ChatPanel, CopilotOrb, InsightsPanel, VoiceInput
│   │   ├── intent/          CreateRuleForm, LenderDashboard, ReceiverDashboard,
│   │   │                    RuleCard, SharedWalletInfo, Unauthorized
│   │   ├── layout/          Header, Sidebar, MobileNav
│   │   ├── rules/           RuleBuilder, TemplateSelector, DeployButton
│   │   ├── transactions/    TransactionCard, TransactionSimulator, LiveFeed, FilterBar
│   │   └── shared/          GlassCard, AnimatedButton, StatusBadge, LoadingSpinner
│   ├── hooks/               useWeb3, useWallet, useTransactions, useCompliance
│   ├── pages/               Dashboard, Transactions, RuleBuilderPage, AIInsights,
│   │                        BlockchainAudit, IntentRules, Settings, Landing
│   ├── services/            api.js (axios), contractService.js (Ethers v6),
│   │                        aiService, policyService, transactionService, walletService
│   └── config/              api.js (URLs/keys), contracts.js (ABI + deployed address)
│
├── backend/                 FastAPI + Python (port 8000)
│   ├── app/routes/          /ai, /policy, /transaction, /wallet, /clawback, /metrics
│   └── app/services/        AI intent parser, compliance ML, validation, explanation
│
└── blockchain/
    └── contracts/           IntentForge.sol — on-chain role enforcement
```

---

## Quick Start

### 1 — Prerequisites

- Node.js ≥ 18
- Python ≥ 3.11
- Hardhat (`npm install -g hardhat`)
- MetaMask browser extension
- Chrome (required for voice input)

### 2 — Start Hardhat local node

```bash
cd intentforge
npx hardhat node
```

Copy the first two accounts shown in the terminal:
- Account #0 → **Lender** (creates + locks ETH rules)
- Account #1 → **Receiver** (claims ETH from rules)

Import both accounts into MetaMask using the **private keys printed in the terminal output** (never store those keys anywhere else).

### 3 — Deploy the contract

```bash
npx hardhat run blockchain/scripts/deploy-intent.js --network localhost
```

This auto-generates `src/config/contracts.js` with the deployed address and ABI.

### 4 — Start the backend

```bash
cd intentforge/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 5 — Start the frontend

```bash
cd intentforge
npm install
npm start
```

Open `http://localhost:3000` → connect MetaMask → app routes based on your account.

---

## Role-Based Access

| Account | Role | Tabs visible | Permissions |
|---------|------|-------------|-------------|
| Account #0 | **LENDER** | Dashboard, Rule Builder, Transactions, AI Insights, Blockchain Audit, Fund Rules, Settings | Create rules, lock ETH, view AI analytics |
| Account #1 | **RECEIVER** | Dashboard, Transactions, Fund Rules, Settings | View rules, claim eligible ETH |
| Any other | **UNAUTHORIZED** | None | Shown an error screen with instructions |

Role detection is purely UI-level. All access enforcement happens in `IntentForge.sol`:
- Only the designated receiver can call `claimIntent(ruleId)`
- Contract rejects claims after expiry or if the rule was already claimed

---

## Smart Contract: IntentForge.sol

Deployed at: `INTENT_FORGE_ADDRESS` in `src/config/contracts.js`
Network: Hardhat Local — Chain ID 1337 — RPC `http://127.0.0.1:8545`

### Key functions

| Function | Who calls | What it does |
|----------|-----------|-------------|
| `createIntent(receiver, expiry)` | Lender | Locks `msg.value` ETH; emits `IntentCreated` |
| `claimIntent(ruleId)` | Receiver | Transfers locked ETH; emits `IntentClaimed` |
| `getUserRules(address)` | Anyone | Returns all `bytes32` rule IDs for that address |
| `getRule(ruleId)` | Anyone | Returns sender, receiver, amount, expiry, active |
| `getRuleStatus(ruleId)` | Anyone | Returns `"ACTIVE"` \| `"CLAIMED"` \| `"EXPIRED"` \| `"NOT_FOUND"` |

### Events

```solidity
event IntentCreated(bytes32 indexed ruleId, address indexed sender, address indexed receiver, uint256 amount, uint256 expiry);
event IntentClaimed(bytes32 indexed ruleId, address indexed receiver, uint256 amount);
```

---

## Features

### On-chain Fund Rules (`/intent`)
- **Lender**: fill receiver address, ETH amount, expiry → submit → MetaMask confirms tx
- **Receiver**: see all rules addressed to them, claim active rules before expiry
- Expired rules show a red warning banner; lender can re-create if needed

### AI Copilot (floating orb)
- Type natural language: *"block gambling for 30 days"*, *"limit food to ₹3000/week"*
- When backend is online: parses intent → returns structured policy → deploy button
- When backend is offline: context-aware guidance based on keywords

### Voice Commands (`/ai` → Voice section)
- Click mic → speak a command → transcript is sent to `parseIntent` API
- Result shown inline (confidence %, parsed policy, deploy option)
- Requires Chrome; uses `SpeechRecognition` API

### AI Recommendations
- Clicking an AI suggestion card sends the description to `parseIntent`
- Response shown inline below the card

### Transaction History (`/transactions`)
- Weekly activity bar chart (approved vs blocked amounts)
- Live Validator: run a test transaction against deployed policies
- Full filterable transaction history

### Compliance & Anomaly Detection (`/ai`)
- Compliance score gauge (0–100), 7-day trend chart
- AI anomaly feed: unusual spending patterns, duplicate charges
- Timeline of compliance events

### Rule Builder (`/rules`) — Lender only
- Template-based rule creation (daily cap, block categories, time lock)
- Deploys to backend policy engine via API

---

## Navigation

### Desktop sidebar
- Lender: 7 items (Dashboard, Rule Builder, Transactions, AI Insights, Blockchain Audit, Fund Rules, Settings)
- Receiver: 4 items (Dashboard, Transactions, Fund Rules, Settings)

### Mobile bottom bar
- Role-filtered subset of above

---

## Error Handling

- MetaMask rejection (code 4001): `"Connection rejected — please approve the request in MetaMask."`
- Pending request (code -32002): `"MetaMask request already pending — please open the extension."`
- All error messages are sanitized: private keys and RPC URLs are redacted before display
- Backend offline: AI features degrade gracefully with helpful offline messages

---

## Settings (`/settings`)

Settings are role-aware:

| Group | Lender | Receiver |
|-------|--------|----------|
| Security | 2-FA, Transaction PIN | 2-FA, Transaction PIN |
| Notifications | Claim Alerts, Expiry Alerts, AI Suggestions | New Rule Alerts, Expiry Reminders, Claim Confirmed |
| Analytics | On-chain Analytics, Data Contribution | — |
| Privacy | Anonymous Mode | Anonymous Mode |
| Danger Zone | Reset All Rules + Clear History | Clear History only |

---

## Backend API (when running)

Base URL: `http://localhost:8000/api/v1`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ai/parse-intent` | POST | NL → structured policy |
| `/ai/suggestions/:walletId` | GET | AI-driven recommendations |
| `/policy/create` | POST | Create and attach a policy |
| `/transaction/validate` | POST | Validate tx against policies |
| `/transaction/wallet/:id/history` | GET | Transaction history |
| `/wallet/create` | POST | Create demo wallet |
| `/metrics/:walletId` | GET | Compliance metrics |

---

## Security Model

- **UI separation is UX only** — any frontend can be bypassed
- **All financial enforcement is on-chain** in `IntentForge.sol`
- The Solidity contract validates: receiver identity, rule activity, expiry timestamp
- Frontend private keys are never stored, logged, or exposed in error messages
