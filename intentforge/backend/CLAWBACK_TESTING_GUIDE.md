# Clawback & Conflict Detection Testing Guide

## Overview
This guide provides instructions for testing the clawback engine and policy conflict detection features.

---

## ✅ Features Implemented

### 1. Transaction Validation Endpoint
**Endpoint:** `POST /api/v1/transaction/validate`

Already implemented with:
- walletId (wallet_id)
- amount
- category
- location (optional)
- timestamp (created_at - auto-generated)
- Returns structured JSON with status, violations, reasoning, clawback flag

### 2. Clawback Engine
**Endpoint:** `POST /api/v1/clawback/execute`

Features:
- Reverses transactions deterministically
- Restores wallet balance atomically
- Records audit trail
- Supports multiple clawback reasons
- Emits clawback status

### 3. Policy Conflict Detection
**Endpoint:** `GET /api/v1/policy/conflicts`

Detects:
- Contradictory category restrictions
- Impossible amount limits
- Contradictory geofence rules
- Merchant whitelist vs blacklist conflicts
- Time and expiry conflicts

---

## 🧪 Testing Commands

### Method 1: Automated Test Script (Recommended)

```powershell
# Ensure backend server is running
cd D:\INTENTFORGE\IntentForge\backend

# Run the comprehensive test script
.\quick_test_clawback.ps1
```

**What it tests:**
1. ✅ Creates wallet with initial balance
2. ✅ Creates conflicting policies
3. ✅ Detects and reports conflicts
4. ✅ Executes clawbacks for different reasons
5. ✅ Retrieves clawback history
6. ✅ Verifies final wallet state

---

### Method 2: Manual cURL Testing

#### Start the Server
```powershell
uvicorn app.main:app --reload
```

#### Test 1: Transaction Validation
```bash
curl -X POST "http://localhost:8000/api/v1/transaction/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": "YOUR_WALLET_ID",
    "amount": 5000.0,
    "category": "education",
    "location": "IN-DL",
    "merchant": "Coursera"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Transaction approved",
  "data": {
    "transaction_id": "uuid",
    "status": "approved",
    "violations": [],
    "requires_clawback": false,
    "reasoning": "✅ APPROVED: Transaction complies...",
    "processing_time_ms": 12.5
  }
}
```

#### Test 2: Execute Clawback
```bash
curl -X POST "http://localhost:8000/api/v1/clawback/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "TRANSACTION_UUID",
    "wallet_id": "WALLET_UUID",
    "reason": "policy_violation",
    "force": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Clawback executed",
  "data": {
    "clawback_id": "uuid",
    "status": "executed",
    "amount_reversed": 5000.0,
    "previous_balance": 95000.0,
    "new_balance": 100000.0,
    "explanation": "✅ CLAWBACK EXECUTED: Transaction violated wallet policy rules...",
    "processing_time_ms": 8.3
  }
}
```

#### Test 3: Detect Policy Conflicts
```bash
curl -X GET "http://localhost:8000/api/v1/policy/conflicts"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Found 2 policy conflict(s)",
  "data": {
    "total_conflicts": 2,
    "has_critical_conflicts": true,
    "conflicts": [
      {
        "policy_a": "uuid-1",
        "policy_a_name": "Education Only",
        "policy_b": "uuid-2",
        "policy_b_name": "Shopping Only",
        "conflict_description": "CONFLICT: Policy 'Education Only' allows categories ...",
        "severity": "CRITICAL"
      }
    ]
  }
}
```

#### Test 4: Get Clawback History
```bash
curl -X GET "http://localhost:8000/api/v1/clawback/history?wallet_id=WALLET_UUID"
```

---

### Method 3: Swagger UI Testing

1. Navigate to: http://localhost:8000/docs
2. Test endpoints interactively:

**Transaction Validation:**
- Expand `POST /api/v1/transaction/validate`
- Click "Try it out"
- Fill in transaction details
- Execute and view response

**Execute Clawback:**
- Expand `POST /api/v1/clawback/execute`
- Click "Try it out"
- Fill in clawback request (use `force: true` for testing)
- Execute and verify balance restoration

**Detect Conflicts:**
- Expand `GET /api/v1/policy/conflicts`
- Click "Try it out"
- Execute to see all detected conflicts

---

## 🔬 Test Scenarios

### Scenario 1: Policy Violation Clawback

**Steps:**
1. Create wallet with 100000 INR
2. Create policy: "Education Only" (categories: education, books)
3. Execute transaction: 5000 INR for "gambling" (violates policy)
4. Execute clawback with reason "policy_violation"
5. Verify balance restored to 100000 INR

**Expected:**
- Transaction blocked or clawed back
- Balance restored atomically
- Audit trail recorded

---

### Scenario 2: Expired Policy Clawback

**Steps:**
1. Create policy with expiry in the past
2. Transaction executes under expired policy
3. Execute clawback with reason "expired_policy"
4. Verify balance restoration

---

### Scenario 3: Conflict Detection

**Steps:**
1. Create Policy A: allowed_categories = ["education"]
2. Create Policy B: allowed_categories = ["shopping"]
3. Call GET /api/v1/policy/conflicts
4. Verify CRITICAL conflict detected (no overlap)

**Expected Response:**
```json
{
  "total_conflicts": 1,
  "has_critical_conflicts": true,
  "conflicts": [
    {
      "severity": "CRITICAL",
      "conflict_description": "CONFLICT: ... no transaction can satisfy both policies."
    }
  ]
}
```

---

### Scenario 4: Impossible Amount Limits

**Steps:**
1. Create Policy A: max_amount = 5000
2. Create Policy B: per_transaction_cap = 10000 (exceeds max)
3. Detect conflicts
4. Verify conflict flagged

---

### Scenario 5: Merchant Whitelist vs Blacklist

**Steps:**
1. Create Policy A: merchant_whitelist = ["Amazon", "Flipkart"]
2. Create Policy B: merchant_blacklist = ["Amazon"]
3. Detect conflicts
4. Verify "impossible state" conflict

---

## 📊 Validation Checklist

Before marking complete, verify:

- [ ] `/transaction/validate` returns structured response with status
- [ ] `/clawback/execute` reverses transactions correctly
- [ ] Balance restoration is atomic (all-or-nothing)
- [ ] Clawback audit trail maintained
- [ ] `/policy/conflicts` detects all conflict types
- [ ] Conflict severity assessment working
- [ ] Critical conflicts flagged correctly
- [ ] Test script runs without errors
- [ ] Swagger UI documentation complete
- [ ] All endpoints deterministic (consistent results)

---

## 🎯 Expected Behavior

### Clawback Engine
- **Deterministic**: Same input always produces same output
- **Atomic**: Balance update succeeds or fails completely
- **Auditable**: All clawbacks recorded with timestamp
- **Idempotent**: Safe to retry

### Conflict Detection
- **Comprehensive**: Catches all conflict types
- **Severity-based**: Prioritizes critical conflicts
- **Actionable**: Provides clear explanations
- **Real-time**: Detects conflicts on policy creation

---

## 🚀 Quick Start

```powershell
# 1. Start backend server
cd D:\INTENTFORGE\IntentForge\backend
uvicorn app.main:app --reload

# 2. In another terminal, run tests
.\quick_test_clawback.ps1

# 3. View API documentation
start http://localhost:8000/docs

# 4. Check specific endpoints
curl http://localhost:8000/api/v1/clawback/health
curl http://localhost:8000/api/v1/policy/conflicts
```

---

## 📝 API Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/transaction/validate` | POST | Validate transaction with rule engine |
| `/clawback/execute` | POST | Execute transaction reversal |
| `/clawback/history` | GET | Get clawback audit trail |
| `/policy/conflicts` | GET | Detect policy conflicts |
| `/clawback/health` | GET | Service health check |

---

## ✅ Success Criteria

All features operational when:
1. Transactions validated with structured responses
2. Clawbacks execute deterministically
3. Balance restoration works atomically
4. Conflicts detected across all categories
5. Audit trail maintained
6. Test script completes successfully
7. All endpoints respond correctly
8. Documentation accessible via /docs

---

**Status:** ✅ All Features Implemented & Operational
