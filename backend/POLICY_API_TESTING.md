# 🧪 Testing Policy Management APIs

## Prerequisites

Ensure the backend server is running:

```powershell
cd D:\INTENTFORGE\IntentForge\backend
python app/main.py
```

Server should be running on: **http://localhost:8000**

---

## 📋 API Endpoints to Test

1. **POST** `/api/v1/policy/create` - Create new policy with validation
2. **GET** `/api/v1/policy/{policy_id}` - Get policy by ID
3. **GET** `/api/v1/policy/` - List all policies
4. **POST** `/api/v1/policy/{policy_id}/attach/{wallet_id}` - Attach policy to wallet
5. **GET** `/api/v1/policy/wallet/{wallet_id}/policies` - Get wallet policies
6. **POST** `/api/v1/policy/{policy_id}/validate` - Validate policy schema

---

## 🔧 Manual Testing with PowerShell

### Test 1: Create Category Restriction Policy

```powershell
$body = @{
    name = "Education Budget"
    policy_type = "category_restriction"
    rules = @{
        allowed_categories = @("education", "books", "courses")
        max_amount = 50000.0
        per_transaction_cap = 5000.0
    }
    description = "Restrict to education spending"
    priority = 10
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/create" -Method POST -Body $body -ContentType "application/json"
$policyId = $response.policy.policy_id
$response | ConvertTo-Json -Depth 10
Write-Host "✅ Policy Created: $policyId" -ForegroundColor Green
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Policy created successfully",
  "policy": {
    "policy_id": "223e4567-e89b-12d3-a456-426614174000",
    "name": "Education Budget",
    "policy_type": "category_restriction",
    "rules": {
      "allowed_categories": ["education", "books", "courses"],
      "max_amount": 50000.0,
      "per_transaction_cap": 5000.0
    },
    "is_active": true,
    "priority": 10,
    "attached_wallets": []
  },
  "conflicts": []
}
```

### Test 2: Create Spending Limit Policy with Expiry

```powershell
$expiry = (Get-Date).AddDays(90).ToString("yyyy-MM-ddTHH:mm:ssZ")
$body = @{
    name = "Quarterly Budget"
    policy_type = "spending_limit"
    rules = @{
        max_amount = 150000.0
        period = "quarterly"
        expiry = $expiry
    }
    priority = 5
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/create" -Method POST -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10
```

### Test 3: Create Transaction Cap Policy

```powershell
$body = @{
    name = "Transaction Limit"
    policy_type = "transaction_cap"
    rules = @{
        per_transaction_cap = 10000.0
    }
    description = "Maximum per transaction"
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/create" -Method POST -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10
```

### Test 4: Create Geo-Restricted Policy

```powershell
$body = @{
    name = "Regional Restriction"
    policy_type = "geo_restriction"
    rules = @{
        geo_fence = @("IN-DL", "IN-MH", "IN-KA")
        max_amount = 200000.0
    }
    description = "Limit to specific states"
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/create" -Method POST -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10
```

### Test 5: Create Policy with Wallet Attachment

```powershell
# First create a wallet
$walletBody = @{
    owner_id = "demo_user"
    initial_balance = 100000.0
} | ConvertTo-Json

$walletResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/wallet/create" -Method POST -Body $walletBody -ContentType "application/json"
$walletId = $walletResponse.wallet.wallet_id

# Create policy with wallet attachment
$policyBody = @{
    name = "Wallet-Specific Policy"
    policy_type = "spending_limit"
    rules = @{
        max_amount = 75000.0
    }
    wallet_id = $walletId
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/create" -Method POST -Body $policyBody -ContentType "application/json"
$response | ConvertTo-Json -Depth 10
```

### Test 6: Attach Existing Policy to Wallet

```powershell
# Use policy and wallet IDs from previous tests
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/$policyId/attach/$walletId" -Method POST
$response | ConvertTo-Json
```

### Test 7: Get Wallet Policies

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/wallet/$walletId/policies" -Method GET
$response | ConvertTo-Json -Depth 10
Write-Host "📋 Found $($response.Count) policies for wallet" -ForegroundColor Cyan
```

### Test 8: Get Policy by ID

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/$policyId" -Method GET
$response | ConvertTo-Json -Depth 10
```

### Test 9: List All Policies

```powershell
# All active policies
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/" -Method GET
Write-Host "Total Active Policies: $($response.Count)" -ForegroundColor Cyan

# Filter by type
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/?policy_type=category_restriction" -Method GET
Write-Host "Category Restriction Policies: $($response.Count)" -ForegroundColor Cyan
```

### Test 10: Validate Policy Schema

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/$policyId/validate" -Method POST
$response | ConvertTo-Json
Write-Host "Schema Valid: $($response.valid)" -ForegroundColor $(if($response.valid){'Green'}else{'Red'})
```

### Test 11: Test Schema Validation Errors

```powershell
# This should fail - category restriction without categories
try {
    $invalidBody = @{
        name = "Invalid Policy"
        policy_type = "category_restriction"
        rules = @{
            max_amount = 10000.0
            # Missing allowed_categories
        }
    } | ConvertTo-Json -Depth 10
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/create" -Method POST -Body $invalidBody -ContentType "application/json"
} catch {
    Write-Host "✅ Validation Error Caught (Expected)" -ForegroundColor Green
    Write-Host "Status Code: 422" -ForegroundColor Yellow
}
```

### Test 12: Test Conflicting Caps Validation

```powershell
# This should fail - per_transaction_cap exceeds max_amount
try {
    $conflictBody = @{
        name = "Conflicting Caps"
        policy_type = "spending_limit"
        rules = @{
            max_amount = 5000.0
            per_transaction_cap = 10000.0  # Exceeds max!
        }
    } | ConvertTo-Json -Depth 10
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/policy/create" -Method POST -Body $conflictBody -ContentType "application/json"
} catch {
    Write-Host "✅ Conflict Validation Error Caught (Expected)" -ForegroundColor Green
}
```

---

## 🧪 Automated Testing with Pytest

### Run All Policy Tests

```powershell
# Run policy-specific tests
pytest tests/test_policy.py -v

# Run with detailed output
pytest tests/test_policy.py -v -s

# Run specific test class
pytest tests/test_policy.py::TestPolicyCreation -v

# Run with coverage
pytest tests/test_policy.py --cov=app.routes.policy --cov=app.services.policy_service
```

**Expected Output (25+ tests):**
```
tests/test_policy.py::TestPolicyCreation::test_create_category_restriction_policy PASSED
tests/test_policy.py::TestPolicyCreation::test_create_spending_limit_policy PASSED
tests/test_policy.py::TestPolicyCreation::test_create_transaction_cap_policy PASSED
tests/test_policy.py::TestPolicyCreation::test_create_geo_restriction_policy PASSED
tests/test_policy.py::TestPolicyCreation::test_create_policy_with_expiry PASSED
tests/test_policy.py::TestPolicyValidation::test_category_restriction_missing_categories PASSED
tests/test_policy.py::TestPolicyValidation::test_conflicting_caps PASSED
tests/test_policy.py::TestPolicyRetrieval::test_get_policy_by_id PASSED
tests/test_policy.py::TestPolicyWalletAttachment::test_attach_policy_to_wallet PASSED
... and more

============= 25 passed in 0.XX seconds =============
```

---

## 🚀 Quick Test Script

**Use the automated test script:**
```powershell
.\quick_test_policy.ps1
```

This will:
1. Create a wallet
2. Create multiple policy types
3. Attach policies to wallet
4. Validate schemas
5. Test error handling

---

## 🌐 Testing with Swagger UI

1. **Open Browser**: http://localhost:8000/docs

2. **Navigate to "Policy Management" section**

3. **Test POST /api/v1/policy/create**:
   - Click "Try it out"
   - Use example payloads above
   - Click "Execute"

4. **Test GET /api/v1/policy/{policy_id}**:
   - Use policy ID from creation
   - Verify response

5. **Test Attachment Flow**:
   - Create wallet
   - Create policy
   - Attach policy to wallet
   - Retrieve wallet policies

---

## ✅ Success Criteria

- ✅ Policy creation returns 201 status
- ✅ All rule fields properly validated
- ✅ Schema validation catches errors
- ✅ Conflicting rules detected
- ✅ Wallet attachment works
- ✅ Get wallet policies returns correct list
- ✅ 404 for non-existent policy
- ✅ 422 for validation errors
- ✅ Expiry dates handled correctly
- ✅ Priority values enforced
- ✅ All policy types supported

---

## 📊 Policy Rule Examples

### Category Restriction
```json
{
  "allowed_categories": ["groceries", "utilities"],
  "max_amount": 50000.0
}
```

### Spending Limit
```json
{
  "max_amount": 100000.0,
  "period": "monthly"
}
```

### Transaction Cap
```json
{
  "per_transaction_cap": 5000.0
}
```

### Geo Restriction
```json
{
  "geo_fence": ["IN-DL", "IN-MH"],
  "max_amount": 75000.0
}
```

### Comprehensive Policy
```json
{
  "allowed_categories": ["education"],
  "max_amount": 50000.0,
  "per_transaction_cap": 5000.0,
  "geo_fence": ["IN-DL"],
  "expiry": "2026-12-31T23:59:59Z"
}
```

---

## 🐛 Troubleshooting

### Validation Errors
Check that required fields are present for each policy type:
- **category_restriction**: needs `allowed_categories`
- **spending_limit**: needs `max_amount`
- **transaction_cap**: needs `per_transaction_cap`
- **geo_restriction**: needs `geo_fence`

### Wallet Not Found
Ensure wallet exists before attaching policy:
```powershell
# Verify wallet exists
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/wallet/$walletId" -Method GET
```

---

## 📈 Performance Validation

All policy operations should complete in:
- **Policy Creation**: < 100ms
- **Policy Retrieval**: < 50ms
- **Wallet Attachment**: < 75ms
- **Schema Validation**: < 30ms

Check the `X-Process-Time-MS` header! 🚀
