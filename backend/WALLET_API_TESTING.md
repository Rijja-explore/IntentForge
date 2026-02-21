# 🧪 Testing Wallet Management APIs

## Prerequisites

Ensure the backend server is running:

```powershell
cd D:\INTENTFORGE\IntentForge\backend
python app/main.py
```

Server should be running on: **http://localhost:8000**

---

## 📋 API Endpoints to Test

1. **POST** `/api/v1/wallet/create` - Create new wallet
2. **GET** `/api/v1/wallet/{wallet_id}` - Get wallet by ID
3. **GET** `/api/v1/wallet/` - List all wallets
4. **GET** `/api/v1/wallet/{wallet_id}/balance` - Get wallet balance

---

## 🔧 Manual Testing with PowerShell

### Test 1: Create a Wallet

```powershell
# Create wallet with initial balance
$body = @{
    owner_id = "user_123"
    currency = "INR"
    initial_balance = 10000.0
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/wallet/create" -Method POST -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10

# Save wallet ID for next tests
$walletId = $response.wallet.wallet_id
Write-Host "✅ Wallet Created: $walletId" -ForegroundColor Green
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Wallet created successfully",
  "wallet": {
    "wallet_id": "123e4567-e89b-12d3-a456-426614174000",
    "owner_id": "user_123",
    "balance": 10000.0,
    "currency": "INR",
    "compliance_score": 1.0,
    "attached_policies": [],
    "is_active": true,
    "is_locked": false,
    "created_at": "2026-02-21T...",
    "updated_at": "2026-02-21T..."
  }
}
```

### Test 2: Create Wallet with Default Values

```powershell
$body = @{
    owner_id = "user_456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/wallet/create" -Method POST -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10
```

**Expected:** Balance = 0.0, Currency = INR (defaults)

### Test 3: Get Wallet by ID

```powershell
# Use wallet ID from Test 1
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/wallet/$walletId" -Method GET
$response | ConvertTo-Json -Depth 10
Write-Host "✅ Wallet Retrieved Successfully" -ForegroundColor Green
```

### Test 4: Get Wallet Balance

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/wallet/$walletId/balance" -Method GET
$response | ConvertTo-Json
Write-Host "💰 Balance: $($response.balance) $($response.currency)" -ForegroundColor Cyan
```

### Test 5: List All Wallets

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/wallet/" -Method GET
Write-Host "📊 Total Wallets: $($response.Count)" -ForegroundColor Cyan
$response | ConvertTo-Json -Depth 10
```

### Test 6: List Wallets by Owner

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/wallet/?owner_id=user_123" -Method GET
Write-Host "👤 Wallets for user_123: $($response.Count)" -ForegroundColor Cyan
$response | ConvertTo-Json -Depth 10
```

### Test 7: Test Non-Existent Wallet (404 Error)

```powershell
try {
    $fakeId = "123e4567-e89b-12d3-a456-426614174999"
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/wallet/$fakeId" -Method GET
} catch {
    Write-Host "❌ Expected 404 Error: Wallet not found" -ForegroundColor Yellow
    $_.Exception.Response.StatusCode
}
```

### Test 8: Test Invalid Data (Validation Error)

```powershell
# Try creating wallet with negative balance
try {
    $body = @{
        owner_id = "user_789"
        initial_balance = -5000.0
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/wallet/create" -Method POST -Body $body -ContentType "application/json"
} catch {
    Write-Host "❌ Expected Validation Error: Negative balance not allowed" -ForegroundColor Yellow
    $_.Exception.Response.StatusCode
}
```

---

## 🧪 Automated Testing with Pytest

### Run All Wallet Tests

```powershell
# Run wallet-specific tests
pytest tests/test_wallet.py -v

# Run with detailed output
pytest tests/test_wallet.py -v -s

# Run specific test class
pytest tests/test_wallet.py::TestWalletCreation -v

# Run with coverage
pytest tests/test_wallet.py --cov=app.routes.wallet --cov=app.services.wallet_service
```

**Expected Output:**
```
tests/test_wallet.py::TestWalletCreation::test_create_wallet_success PASSED
tests/test_wallet.py::TestWalletCreation::test_create_wallet_default_values PASSED
tests/test_wallet.py::TestWalletCreation::test_create_wallet_missing_owner_id PASSED
tests/test_wallet.py::TestWalletCreation::test_create_wallet_negative_balance PASSED
tests/test_wallet.py::TestWalletRetrieval::test_get_wallet_by_id_success PASSED
tests/test_wallet.py::TestWalletRetrieval::test_get_wallet_not_found PASSED
tests/test_wallet.py::TestWalletRetrieval::test_get_wallet_invalid_uuid PASSED
tests/test_wallet.py::TestWalletRetrieval::test_get_wallet_balance PASSED
tests/test_wallet.py::TestWalletListing::test_list_all_wallets PASSED
tests/test_wallet.py::TestWalletListing::test_list_wallets_by_owner PASSED
tests/test_wallet.py::TestWalletResponseFormat::test_response_is_deterministic PASSED
tests/test_wallet.py::TestWalletResponseFormat::test_response_schema_completeness PASSED
tests/test_wallet.py::TestWalletResponseFormat::test_processing_time_header PASSED

============= 13 passed in 0.XX seconds =============
```

---

## 🌐 Testing with Swagger UI

1. **Open Browser**: http://localhost:8000/docs

2. **Navigate to "Wallet Management" section**

3. **Test POST /api/v1/wallet/create**:
   - Click "Try it out"
   - Enter JSON:
     ```json
     {
       "owner_id": "swagger_test_user",
       "currency": "INR",
       "initial_balance": 15000
     }
     ```
   - Click "Execute"
   - Copy the `wallet_id` from response

4. **Test GET /api/v1/wallet/{wallet_id}**:
   - Click "Try it out"
   - Paste the wallet_id
   - Click "Execute"
   - Verify response matches created wallet

5. **Test GET /api/v1/wallet/**:
   - Click "Try it out"
   - Leave owner_id empty or enter one
   - Click "Execute"
   - View list of all wallets

---

## 📊 Complete Test Script

Save this as `test_wallet_endpoints.ps1`:

```powershell
# Complete Wallet API Test Script
Write-Host "🚀 Testing IntentForge Wallet APIs" -ForegroundColor Cyan
Write-Host "=" * 60

$baseUrl = "http://localhost:8000/api/v1"

# Test 1: Create Wallet
Write-Host "`n✅ Test 1: Creating wallet..." -ForegroundColor Green
$body = @{
    owner_id = "test_user_$(Get-Random)"
    currency = "INR"
    initial_balance = 25000.0
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/wallet/create" -Method POST -Body $body -ContentType "application/json"
    $walletId = $response.wallet.wallet_id
    Write-Host "   Wallet ID: $walletId" -ForegroundColor White
    Write-Host "   Balance: $($response.wallet.balance) $($response.wallet.currency)" -ForegroundColor White
    Write-Host "   Compliance Score: $($response.wallet.compliance_score)" -ForegroundColor White
    Write-Host "   ✓ Test 1 PASSED" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Test 1 FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Get Wallet
Write-Host "`n✅ Test 2: Retrieving wallet..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/wallet/$walletId" -Method GET
    Write-Host "   Owner: $($response.owner_id)" -ForegroundColor White
    Write-Host "   Balance: $($response.balance)" -ForegroundColor White
    Write-Host "   ✓ Test 2 PASSED" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Test 2 FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Balance
Write-Host "`n✅ Test 3: Getting wallet balance..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/wallet/$walletId/balance" -Method GET
    Write-Host "   Balance: $($response.balance) $($response.currency)" -ForegroundColor White
    Write-Host "   Locked: $($response.is_locked)" -ForegroundColor White
    Write-Host "   ✓ Test 3 PASSED" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Test 3 FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: List Wallets
Write-Host "`n✅ Test 4: Listing all wallets..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/wallet/" -Method GET
    Write-Host "   Total Wallets: $($response.Count)" -ForegroundColor White
    Write-Host "   ✓ Test 4 PASSED" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Test 4 FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Error Handling (404)
Write-Host "`n✅ Test 5: Testing error handling (404)..." -ForegroundColor Green
try {
    $fakeId = "123e4567-e89b-12d3-a456-426614174999"
    $response = Invoke-RestMethod -Uri "$baseUrl/wallet/$fakeId" -Method GET
    Write-Host "   ✗ Test 5 FAILED: Should have thrown 404" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   ✓ Test 5 PASSED: Correctly returned 404" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Test 5 FAILED: Wrong error code" -ForegroundColor Red
    }
}

Write-Host "`n" + ("=" * 60)
Write-Host "🎉 All tests completed!" -ForegroundColor Cyan
Write-Host "=" * 60
```

**Run the script:**
```powershell
.\test_wallet_endpoints.ps1
```

---

## ✅ Success Criteria

- ✅ Wallet creation returns 201 status
- ✅ All required fields present in response
- ✅ Wallet ID is valid UUID format
- ✅ Default values applied correctly
- ✅ Wallet retrieval works with valid ID
- ✅ 404 returned for non-existent wallet
- ✅ Validation errors for invalid data
- ✅ List endpoints return arrays
- ✅ Response time < 200ms
- ✅ Compliance score initialized to 1.0
- ✅ Processing time header present

---

## 🐛 Troubleshooting

### Server Not Running
```powershell
# Check if server is running
Test-NetConnection -ComputerName localhost -Port 8000
```

### Connection Refused
```powershell
# Restart server
cd D:\INTENTFORGE\IntentForge\backend
python app/main.py
```

### JSON Parsing Errors
```powershell
# Ensure proper JSON format with ConvertTo-Json
$body = @{...} | ConvertTo-Json
```

---

## 📈 Performance Validation

All wallet operations should complete in:
- **Wallet Creation**: < 100ms
- **Wallet Retrieval**: < 50ms
- **Balance Check**: < 30ms
- **List Operations**: < 150ms

Check the `X-Process-Time-MS` header in responses! 🚀
