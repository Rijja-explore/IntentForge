# Quick Transaction Validation Test Script
# Tests the deterministic rule engine with various scenarios

$baseUrl = "http://localhost:8000/api/v1"
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Quick Transaction Validation Test" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

# Step 1: Create a test wallet
Write-Host ""
Write-Host "1. Creating test wallet..." -ForegroundColor Yellow

$walletBody = @{
    owner_id = "transaction_test_user"
    currency = "INR"
    initial_balance = 100000.0
} | ConvertTo-Json

try {
    $wallet = Invoke-RestMethod -Uri "$baseUrl/wallet/create" -Method POST -Body $walletBody -ContentType "application/json"
    $walletId = $wallet.wallet.wallet_id
    Write-Host "Wallet Created: $walletId" -ForegroundColor Green
}
catch {
    Write-Host "Wallet creation FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    return
}

# Step 2: Category Restriction Policy
Write-Host ""
Write-Host "2. Creating category restriction policy..." -ForegroundColor Yellow

$categoryPolicyBody = @{
    name = "Education Only Policy"
    description = "Allow only education-related spending"
    policy_type = "category_restriction"
    wallet_id = $walletId
    rules = @{
        allowed_categories = @("education", "books", "courses")
    }
} | ConvertTo-Json -Depth 10

$categoryPolicy = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method POST -Body $categoryPolicyBody -ContentType "application/json"
Write-Host "Category Policy Created: $($categoryPolicy.policy.policy_id)" -ForegroundColor Green

# Step 3: Amount Policy
Write-Host ""
Write-Host "3. Creating spending limit policy..." -ForegroundColor Yellow

$amountPolicyBody = @{
    name = "Spending Limit Policy"
    description = "Maximum 50000 INR spending"
    policy_type = "spending_limit"
    wallet_id = $walletId
    rules = @{
        max_amount = 50000.0
        per_transaction_cap = 10000.0
    }
} | ConvertTo-Json -Depth 10

$amountPolicy = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method POST -Body $amountPolicyBody -ContentType "application/json"
Write-Host "Amount Policy Created: $($amountPolicy.policy.policy_id)" -ForegroundColor Green

# Step 4: Geo Policy
Write-Host ""
Write-Host "4. Creating geo restriction policy..." -ForegroundColor Yellow

$geoPolicyBody = @{
    name = "Geo Restriction Policy"
    description = "Only Delhi and Maharashtra allowed"
    policy_type = "geo_restriction"
    wallet_id = $walletId
    rules = @{
        geo_fence = @("IN-DL", "IN-MH")
    }
} | ConvertTo-Json -Depth 10

$geoPolicy = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method POST -Body $geoPolicyBody -ContentType "application/json"
Write-Host "Geo Policy Created: $($geoPolicy.policy.policy_id)" -ForegroundColor Green

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Magenta
Write-Host "TRANSACTION VALIDATION TESTS" -ForegroundColor Magenta
Write-Host ("=" * 60) -ForegroundColor Magenta

# Helper function
function Run-Test($title, $body) {
    Write-Host ""
    Write-Host $title -ForegroundColor Yellow

    try {
        $json = $body | ConvertTo-Json -Depth 10
        $result = Invoke-RestMethod -Uri "$baseUrl/transaction/validate" -Method POST -Body $json -ContentType "application/json"

        Write-Host "Status: $($result.data.status)" -ForegroundColor Green
        Write-Host "Decision: $($result.data.decision)" -ForegroundColor Green
        Write-Host "Violations: $($result.data.violations.Count)" -ForegroundColor Cyan
        Write-Host "Processing Time: $($result.data.processing_time_ms) ms" -ForegroundColor Cyan
    }
    catch {
        Write-Host "Blocked / Error" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# Test Cases

Run-Test "5. Valid education transaction (EXPECTED: APPROVED)" @{
    wallet_id = $walletId
    amount = 5000.0
    category = "education"
    merchant = "Coursera"
    location = "IN-DL"
}

Run-Test "6. Invalid category (EXPECTED: BLOCKED)" @{
    wallet_id = $walletId
    amount = 2000.0
    category = "entertainment"
    merchant = "Netflix"
    location = "IN-DL"
}

Run-Test "7. Amount exceeds policy (EXPECTED: BLOCKED)" @{
    wallet_id = $walletId
    amount = 75000.0
    category = "education"
    merchant = "University"
    location = "IN-DL"
}

Run-Test "8. Per-transaction cap exceeded (EXPECTED: BLOCKED)" @{
    wallet_id = $walletId
    amount = 12000.0
    category = "education"
    merchant = "Institute"
    location = "IN-DL"
}

Run-Test "9. GeoFence violation (EXPECTED: BLOCKED)" @{
    wallet_id = $walletId
    amount = 3000.0
    category = "education"
    merchant = "Bookstore"
    location = "IN-KA"
}

Run-Test "10. Multiple violations (EXPECTED: BLOCKED)" @{
    wallet_id = $walletId
    amount = 8000.0
    category = "shopping"
    merchant = "Mall"
    location = "IN-TN"
}

# Simulation Test
Write-Host ""
Write-Host "11. Simulation Test" -ForegroundColor Yellow

$simulateBody = @{
    wallet_id = $walletId
    amount = 4500.0
    category = "books"
    merchant = "Amazon"
    location = "IN-MH"
} | ConvertTo-Json -Depth 10

$resultSim = Invoke-RestMethod -Uri "$baseUrl/transaction/simulate" -Method POST -Body $simulateBody -ContentType "application/json"

Write-Host "Simulation Status: $($resultSim.data.status)" -ForegroundColor Green
Write-Host "Processing Time: $($resultSim.data.processing_time_ms) ms" -ForegroundColor Cyan

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "All transaction validation tests completed!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan

Write-Host ""
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Validate Endpoint: POST $baseUrl/transaction/validate" -ForegroundColor Cyan
Write-Host "Simulate Endpoint: POST $baseUrl/transaction/simulate" -ForegroundColor Cyan
Write-Host ""
Write-Host "Rule Engine: Deterministic & Operational" -ForegroundColor Green