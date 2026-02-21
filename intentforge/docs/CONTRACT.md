# Smart Contract Architecture

## IntentForgeAudit Contract

### Purpose

Financial Integrity & Audit Infrastructure for programmable Digital Rupee. This is NOT a DeFi token contract - it's a compliance-grade governance backbone.

### Core Responsibilities

1. **Policy Registration** - Store tamper-proof policy metadata
2. **Transaction Logging** - Record validation decisions
3. **Violation Recording** - Track compliance breaches
4. **Clawback Logging** - Document transaction reversals

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                 IntentForgeAudit Contract               │
│                 (Financial Governance Layer)            │
└─────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
    │ Policy  │     │  Txn    │     │Violation│
    │Registry │     │ Logging │     │Recording│
    └─────────┘     └─────────┘     └─────────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
                  ┌───────▼────────┐
                  │  Clawback      │
                  │  Tracking      │
                  └────────────────┘
```

---

## Data Structures

### Policy

```solidity
struct Policy {
    string walletId;        // Unique wallet identifier
    bytes32 policyHash;     // keccak256(policy JSON)
    uint256 timestamp;      // Registration time
    address deployedBy;     // Backend service account
    bool isActive;          // Active status
}
```

**Storage**: `mapping(bytes32 => Policy) policies`  
**Key**: `keccak256(walletId)`

### TransactionLog

```solidity
enum Decision { APPROVED, BLOCKED, VIOLATION }

struct TransactionLog {
    string walletId;        // Transaction initiator
    string txId;            // Unique transaction ID
    Decision decision;      // Outcome (0, 1, or 2)
    bytes32 policyHash;     // Policy applied
    uint256 timestamp;      // Log time
    address loggedBy;       // Backend service account
}
```

**Storage**: `mapping(bytes32 => TransactionLog) transactionLogs`  
**Key**: `keccak256(txId)`

### ViolationRecord

```solidity
struct ViolationRecord {
    string txId;            // Violating transaction ID
    bytes32 reasonHash;     // keccak256(reason string)
    string penaltyApplied;  // Penalty description
    uint256 timestamp;      // Violation time
    address recordedBy;     // Backend service account
}
```

**Storage**: `mapping(bytes32 => ViolationRecord) violationRecords`  
**Key**: `keccak256(txId)`

### ClawbackRecord

```solidity
struct ClawbackRecord {
    string originalTxId;    // Original transaction
    string clawbackTxId;    // Reversal transaction
    bytes32 reasonHash;     // keccak256(reason string)
    uint256 timestamp;      // Clawback time
    address executedBy;     // Backend service account
}
```

**Storage**: `mapping(bytes32 => ClawbackRecord) clawbackRecords`  
**Key**: `keccak256(clawbackTxId)`

---

## Access Control

### Owner (System Admin)

**Account**: Hardhat Account[0]

**Permissions**:

- Update backend service account
- Transfer ownership

**Restrictions**:

- Cannot log transactions
- Cannot register policies
- Cannot record violations

### Backend Service Account

**Account**: Hardhat Account[1]

**Permissions**:

- Register policies
- Log transactions
- Record violations
- Log clawbacks

**Restrictions**:

- Cannot update backend service account
- Cannot transfer ownership

### Implementation

Uses OpenZeppelin's `Ownable` contract:

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract IntentForgeAudit is Ownable {
    address public backendServiceAccount;

    modifier onlyBackendService() {
        require(msg.sender == backendServiceAccount, "Unauthorized");
        _;
    }
}
```

---

## Events

All state changes emit events for transparency and auditability.

### PolicyRegistered

```solidity
event PolicyRegistered(
    string indexed walletId,
    bytes32 indexed policyHash,
    uint256 timestamp,
    address indexed deployedBy
);
```

**When**: Policy registration successful  
**Indexed**: walletId, policyHash, deployedBy

### TransactionLogged

```solidity
event TransactionLogged(
    string indexed walletId,
    string indexed txId,
    Decision decision,
    bytes32 policyHash,
    uint256 timestamp
);
```

**When**: Transaction validation logged  
**Indexed**: walletId, txId

### ViolationRecorded

```solidity
event ViolationRecorded(
    string indexed txId,
    bytes32 indexed reasonHash,
    string penaltyApplied,
    uint256 timestamp
);
```

**When**: Compliance violation recorded  
**Indexed**: txId, reasonHash

### ClawbackExecuted

```solidity
event ClawbackExecuted(
    string indexed originalTxId,
    string indexed clawbackTxId,
    bytes32 reasonHash,
    uint256 timestamp
);
```

**When**: Clawback logged  
**Indexed**: originalTxId, clawbackTxId

### BackendServiceAccountUpdated

```solidity
event BackendServiceAccountUpdated(
    address indexed oldAccount,
    address indexed newAccount
);
```

**When**: Backend service account changed  
**Indexed**: oldAccount, newAccount

---

## Function Reference

### Administrative Functions

#### `updateBackendServiceAccount(address _newBackendAccount)`

**Access**: Owner only  
**Purpose**: Update backend service account  
**Gas**: ~30,000

### Policy Functions

#### `registerPolicy(string memory _walletId, bytes32 _policyHash)`

**Access**: Backend service only  
**Purpose**: Register new policy  
**Validation**:

- walletId not empty
- policyHash not zero
- Policy doesn't already exist
  **Gas**: ~150,000

#### `getPolicy(string memory _walletId) returns (Policy memory)`

**Access**: Public view  
**Purpose**: Retrieve policy details  
**Gas**: Free (view function)

#### `isPolicyActive(string memory _walletId) returns (bool)`

**Access**: Public view  
**Purpose**: Check policy activation  
**Gas**: Free (view function)

### Transaction Functions

#### `logTransaction(string memory _walletId, string memory _txId, Decision _decision, bytes32 _policyHash)`

**Access**: Backend service only  
**Purpose**: Log transaction validation  
**Validation**:

- walletId not empty
- txId not empty
- policyHash not zero
- Transaction not already logged
  **Gas**: ~120,000

#### `getTransactionLog(string memory _txId) returns (TransactionLog memory)`

**Access**: Public view  
**Purpose**: Retrieve transaction log  
**Gas**: Free (view function)

### Violation Functions

#### `recordViolation(string memory _txId, bytes32 _reasonHash, string memory _penaltyApplied)`

**Access**: Backend service only  
**Purpose**: Record compliance violation  
**Validation**:

- txId not empty
- reasonHash not zero
- Violation not already recorded
  **Gas**: ~110,000

#### `getViolationRecord(string memory _txId) returns (ViolationRecord memory)`

**Access**: Public view  
**Purpose**: Retrieve violation details  
**Gas**: Free (view function)

### Clawback Functions

#### `logClawback(string memory _originalTxId, string memory _clawbackTxId, bytes32 _reasonHash)`

**Access**: Backend service only  
**Purpose**: Log clawback execution  
**Validation**:

- originalTxId not empty
- clawbackTxId not empty
- reasonHash not zero
- Clawback not already logged
  **Gas**: ~105,000

#### `getClawbackRecord(string memory _clawbackTxId) returns (ClawbackRecord memory)`

**Access**: Public view  
**Purpose**: Retrieve clawback details  
**Gas**: Free (view function)

---

## Security Considerations

### No External Calls

Zero external contract calls → no reentrancy risk

### No ETH Handling

No payable functions → no fund management complexity

### Input Validation

All functions validate inputs:

- Non-empty strings
- Non-zero hashes
- Duplicate prevention

### Hash-Based Privacy

Sensitive data hashed before storage:

- Policy JSON → policyHash
- Violation reason → reasonHash
- Clawback reason → reasonHash

### Immutable Logs

Once logged, records cannot be:

- Modified
- Deleted
- Overwritten

### Role Separation

Clear separation of concerns:

- Owner: Administrative only
- Backend: Operational logging only

---

## Gas Optimization

1. **Minimal Storage**: Only essential data on-chain
2. **Efficient Mappings**: O(1) lookups via hashing
3. **Event Indexing**: Up to 3 indexed parameters for efficient filtering
4. **Optimized Compiler**: Solidity 0.8.20 with 200 runs
5. **No Loops**: Fixed complexity operations

---

## Upgrade Strategy

**Current**: Non-upgradeable (v1.0.0)

**Future Options**:

1. Deploy new contract version
2. Migrate critical data
3. Update backend service configuration
4. Implement proxy pattern if needed

**Philosophy**: Simplicity and determinism over upgradeability complexity

---

## Testing Coverage

Comprehensive test suite covers:

- ✅ Deployment validation
- ✅ Access control enforcement
- ✅ Policy registration (success + failures)
- ✅ Transaction logging (all decisions)
- ✅ Violation recording
- ✅ Clawback logging
- ✅ Event emissions
- ✅ Integration scenarios

**Total Tests**: 40+  
**Coverage**: All critical paths
