# ============================================================================
# IntentForge - ML & Compliance Metrics Test Script
# Tests: Compliance Scoring, Risk Analysis, Anomaly Detection
# ============================================================================

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:8000/api/v1"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  IntentForge - ML & Compliance Metrics Test Suite" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# Test 1: Metrics Service Health Check
# ============================================================================
Write-Host "`[TEST 1`] Metrics Service Health Check" -ForegroundColor Yellow
Write-Host "GET $baseUrl/metrics/health" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/metrics/health" -Method Get -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Service: $($response.data.service)" -ForegroundColor Gray
    Write-Host "  Status: $($response.data.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Setup: Create Test Wallet
# ============================================================================
Write-Host "`[SETUP`] Creating Test Wallet for Compliance Metrics" -ForegroundColor Cyan
$walletRequest = @{
    name = "Compliance Test Wallet"
    initial_balance = 50000.0
    owner_id = "test-user-ml-001"
} | ConvertTo-Json -Depth 10

try {
    $walletResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/create" -Method Post -Body $walletRequest -ContentType "application/json"
    $testWalletId = $walletResponse.data.id
    Write-Host "✓ Wallet Created: $testWalletId" -ForegroundColor Green
    Write-Host "  Balance: $($walletResponse.data.balance)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to create wallet: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# ============================================================================
# Setup: Create Test Policy
# ============================================================================
Write-Host "`[SETUP`] Creating Test Policy" -ForegroundColor Cyan
$policyRequest = @{
    name = "ML Test Policy"
    wallet_id = $testWalletId
    max_amount = 10000.0
    categories = @("shopping", "food", "entertainment")
    daily_limit = 5000.0
    monthly_limit = 50000.0
    allowed_locations = @("IN-DL", "IN-MH")
} | ConvertTo-Json -Depth 10

try {
    $policyResponse = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method Post -Body $policyRequest -ContentType "application/json"
    $testPolicyId = $policyResponse.data.id
    Write-Host "✓ Policy Created: $testPolicyId" -ForegroundColor Green
    Write-Host "  Name: $($policyResponse.data.name)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to create policy: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 2: Get Compliance Score (Initial)
# ============================================================================
Write-Host "`[TEST 2`] Get Compliance Score - Initial State" -ForegroundColor Yellow
Write-Host "GET $baseUrl/metrics/compliance?wallet_id=$testWalletId" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/metrics/compliance?wallet_id=$testWalletId" -Method Get -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Compliance Score: $($response.data.compliance_score)" -ForegroundColor Gray
    Write-Host "  Risk Level: $($response.data.risk_level)" -ForegroundColor Gray
    Write-Host "  Data Source: $($response.data.data_source)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Component Scores:" -ForegroundColor White
    Write-Host "    Policy Adherence: $($response.data.component_scores.policy_adherence_score)" -ForegroundColor Gray
    Write-Host "    Pattern Score: $($response.data.component_scores.pattern_score)" -ForegroundColor Gray
    Write-Host "    Risk Score: $($response.data.component_scores.risk_score)" -ForegroundColor Gray
    Write-Host ""
    if ($response.data.anomalies.Count -gt 0) {
        Write-Host "  Anomalies Detected:" -ForegroundColor Yellow
        foreach ($anomaly in $response.data.anomalies) {
            Write-Host "    • $($anomaly.type): $($anomaly.description)" -ForegroundColor Gray
        }
        Write-Host ""
    } else {
        Write-Host "  Anomalies: None detected" -ForegroundColor Green
        Write-Host ""
    }
    Write-Host "  Behavioral Insights:" -ForegroundColor White
    foreach ($insight in $response.data.insights) {
        Write-Host "    • $insight" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 3: Detailed Risk Analysis
# ============================================================================
Write-Host "`[TEST 3`] Detailed Risk Analysis" -ForegroundColor Yellow
Write-Host "GET $baseUrl/metrics/wallet/$testWalletId/risk-analysis" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/metrics/wallet/$testWalletId/risk-analysis" -Method Get -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Overall Risk Score: $($response.data.risk_score)" -ForegroundColor Gray
    Write-Host "  Risk Level: $($response.data.risk_level)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Risk Factors:" -ForegroundColor White
    Write-Host "    High Value Transactions: $($response.data.risk_factors.high_value_transaction_ratio)" -ForegroundColor Gray
    Write-Host "    Rejection Rate: $($response.data.risk_factors.rejection_rate)" -ForegroundColor Gray
    Write-Host "    Velocity Risk: $($response.data.risk_factors.velocity_risk_score)" -ForegroundColor Gray
    Write-Host "    Location Diversity: $($response.data.risk_factors.location_diversity_score)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Transaction Analysis:" -ForegroundColor White
    Write-Host "    Total Transactions: $($response.data.transaction_analysis.total_transactions)" -ForegroundColor Gray
    Write-Host "    Approved: $($response.data.transaction_analysis.approved_count)" -ForegroundColor Gray
    Write-Host "    Blocked: $($response.data.transaction_analysis.blocked_count)" -ForegroundColor Gray
    Write-Host "    Average Amount: $($response.data.transaction_analysis.average_amount)" -ForegroundColor Gray
    Write-Host "    Max Amount: $($response.data.transaction_analysis.max_amount)" -ForegroundColor Gray
    Write-Host ""
    if ($response.data.anomalies.Count -gt 0) {
        Write-Host "  Anomalies:" -ForegroundColor Yellow
        foreach ($anomaly in $response.data.anomalies) {
            Write-Host "    • [$($anomaly.type)] $($anomaly.description)" -ForegroundColor Gray
            Write-Host "      Timestamp: $($anomaly.timestamp)" -ForegroundColor DarkGray
        }
        Write-Host ""
    }
    Write-Host "  Recommendations:" -ForegroundColor White
    foreach ($rec in $response.data.recommendations) {
        Write-Host "    • $rec" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 4: Validate Transactions to Generate History
# ============================================================================
Write-Host "`[TEST 4`] Validating Transactions to Build ML History" -ForegroundColor Yellow
Write-Host "Creating multiple transactions for pattern analysis..." -ForegroundColor Gray
Write-Host ""

# Small approved transaction
$tx1 = @{
    wallet_id = $testWalletId
    amount = 500.0
    merchant = "Coffee Shop"
    category = "food"
    location = "IN-DL"
} | ConvertTo-Json -Depth 10

try {
    $r1 = Invoke-RestMethod -Uri "$baseUrl/transaction/validate" -Method Post -Body $tx1 -ContentType "application/json"
    Write-Host "  Transaction 1: $($r1.data.result) - ₹500 food" -ForegroundColor Gray
} catch { }

# Another small transaction
$tx2 = @{
    wallet_id = $testWalletId
    amount = 1200.0
    merchant = "Grocery Store"
    category = "food"
    location = "IN-MH"
} | ConvertTo-Json -Depth 10

try {
    $r2 = Invoke-RestMethod -Uri "$baseUrl/transaction/validate" -Method Post -Body $tx2 -ContentType "application/json"
    Write-Host "  Transaction 2: $($r2.data.result) - ₹1200 food" -ForegroundColor Gray
} catch { }

# Large shopping transaction
$tx3 = @{
    wallet_id = $testWalletId
    amount = 8500.0
    merchant = "Fashion Store"
    category = "shopping"
    location = "IN-DL"
} | ConvertTo-Json -Depth 10

try {
    $r3 = Invoke-RestMethod -Uri "$baseUrl/transaction/validate" -Method Post -Body $tx3 -ContentType "application/json"
    Write-Host "  Transaction 3: $($r3.data.result) - ₹8500 shopping" -ForegroundColor Gray
} catch { }

# Violating transaction (too high)
$tx4 = @{
    wallet_id = $testWalletId
    amount = 15000.0
    merchant = "Electronics Store"
    category = "shopping"
    location = "IN-DL"
} | ConvertTo-Json -Depth 10

try {
    $r4 = Invoke-RestMethod -Uri "$baseUrl/transaction/validate" -Method Post -Body $tx4 -ContentType "application/json"
    Write-Host "  Transaction 4: $($r4.data.result) - ₹15000 shopping (expected BLOCKED)" -ForegroundColor Gray
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  Transaction 4: BLOCKED - ₹15000 shopping" -ForegroundColor Gray
}

# Entertainment transaction
$tx5 = @{
    wallet_id = $testWalletId
    amount = 2000.0
    merchant = "Movie Theater"
    category = "entertainment"
    location = "IN-MH"
} | ConvertTo-Json -Depth 10

try {
    $r5 = Invoke-RestMethod -Uri "$baseUrl/transaction/validate" -Method Post -Body $tx5 -ContentType "application/json"
    Write-Host "  Transaction 5: $($r5.data.result) - ₹2000 entertainment" -ForegroundColor Gray
} catch { }

Write-Host ""
Write-Host "✓ Transaction history created" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Test 5: Re-check Compliance Score After Transactions
# ============================================================================
Write-Host "`[TEST 5`] Compliance Score After Transaction Activity" -ForegroundColor Yellow
Write-Host "GET $baseUrl/metrics/compliance?wallet_id=$testWalletId" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/metrics/compliance?wallet_id=$testWalletId" -Method Get -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Compliance Score: $($response.data.compliance_score)" -ForegroundColor Gray
    Write-Host "  Risk Level: $($response.data.risk_level)" -ForegroundColor Gray
    Write-Host "  Analysis Period: $($response.data.analysis_period.start) to $($response.data.analysis_period.end)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Component Scores:" -ForegroundColor White
    Write-Host "    Policy Adherence: $($response.data.component_scores.policy_adherence_score)" -ForegroundColor Gray
    Write-Host "    Transaction Patterns: $($response.data.component_scores.pattern_score)" -ForegroundColor Gray
    Write-Host "    Risk Assessment: $($response.data.component_scores.risk_score)" -ForegroundColor Gray
    Write-Host ""
    if ($response.data.anomalies.Count -gt 0) {
        Write-Host "  Anomalies Detected:" -ForegroundColor Yellow
        foreach ($anomaly in $response.data.anomalies) {
            Write-Host "    • [$($anomaly.severity)] $($anomaly.type)" -ForegroundColor Gray
            Write-Host "      $($anomaly.description)" -ForegroundColor DarkGray
        }
        Write-Host ""
    }
    Write-Host "  Key Insights:" -ForegroundColor White
    foreach ($insight in $response.data.insights) {
        Write-Host "    • $insight" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 6: ML Scoring with Different Wallet (No History)
# ============================================================================
Write-Host "`[TEST 6`] ML Scoring for New Wallet (No Transaction History)" -ForegroundColor Yellow

# Create new wallet without transactions
$newWalletRequest = @{
    name = "Fresh ML Wallet"
    initial_balance = 25000.0
    owner_id = "test-user-ml-002"
} | ConvertTo-Json -Depth 10

try {
    $newWalletResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/create" -Method Post -Body $newWalletRequest -ContentType "application/json"
    $newWalletId = $newWalletResponse.data.id
    Write-Host "✓ New Wallet Created: $newWalletId" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "GET $baseUrl/metrics/compliance?wallet_id=$newWalletId" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri "$baseUrl/metrics/compliance?wallet_id=$newWalletId" -Method Get -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Compliance Score: $($response.data.compliance_score)" -ForegroundColor Gray
    Write-Host "  Risk Level: $($response.data.risk_level)" -ForegroundColor Gray
    Write-Host "  Data Source: $($response.data.data_source) (Expected: synthetic or mock)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Note: New wallets use synthetic data for demo purposes" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 7: Invalid Wallet ID (Error Handling)
# ============================================================================
Write-Host "`[TEST 7`] Invalid Wallet ID - Error Handling" -ForegroundColor Yellow
$invalidWalletId = "invalid-wallet-id-12345"
Write-Host "GET $baseUrl/metrics/compliance?wallet_id=$invalidWalletId" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/metrics/compliance?wallet_id=$invalidWalletId" -Method Get -ContentType "application/json"
    Write-Host "✗ Should have returned error for invalid wallet" -ForegroundColor Red
    Write-Host ""
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Status: ERROR (Expected)" -ForegroundColor Green
    Write-Host "  Error Code: $($errorResponse.error)" -ForegroundColor Gray
    Write-Host "  Message: $($errorResponse.message)" -ForegroundColor Gray
    Write-Host ""
}

# ============================================================================
# Test 8: Missing wallet_id Parameter
# ============================================================================
Write-Host "`[TEST 8`] Missing wallet_id Parameter - Validation" -ForegroundColor Yellow
Write-Host "GET $baseUrl/metrics/compliance (no wallet_id)" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/metrics/compliance" -Method Get -ContentType "application/json"
    Write-Host "✗ Should have returned validation error" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "✓ Status: VALIDATION_ERROR (Expected)" -ForegroundColor Green
    Write-Host "  Error: wallet_id query parameter is required" -ForegroundColor Gray
    Write-Host ""
}

# ============================================================================
# Cleanup
# ============================================================================
Write-Host "`[CLEANUP`] Removing Test Resources" -ForegroundColor Cyan
try {
    # Delete test wallet
    $deleteUrl = "$baseUrl/wallet/$testWalletId"
    Invoke-RestMethod -Uri $deleteUrl -Method Delete -ContentType "application/json" | Out-Null
    Write-Host "✓ Test wallet deleted: $testWalletId" -ForegroundColor Green
    
    # Delete new test wallet
    $deleteUrl2 = "$baseUrl/wallet/$newWalletId"
    Invoke-RestMethod -Uri $deleteUrl2 -Method Delete -ContentType "application/json" | Out-Null
    Write-Host "✓ New wallet deleted: $newWalletId" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "⚠ Cleanup warning: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# Test Summary
# ============================================================================
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  ML & Compliance Metrics Test Suite Completed" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tests covered:" -ForegroundColor White
Write-Host "  ✓ Metrics service health check" -ForegroundColor Gray
Write-Host "  ✓ Initial compliance scoring for new wallet" -ForegroundColor Gray
Write-Host "  ✓ Detailed risk analysis with risk factors" -ForegroundColor Gray
Write-Host "  ✓ Transaction validation to build history" -ForegroundColor Gray
Write-Host "  ✓ Re-evaluation of compliance after activity" -ForegroundColor Gray
Write-Host "  ✓ ML scoring with synthetic data (no history)" -ForegroundColor Gray
Write-Host "  ✓ Invalid wallet ID error handling" -ForegroundColor Gray
Write-Host "  ✓ Missing parameter validation" -ForegroundColor Gray
Write-Host ""
Write-Host "ML Features Demonstrated:" -ForegroundColor Yellow
Write-Host "  • Compliance score computation (0.0-1.0)" -ForegroundColor Gray
Write-Host "  • Multi-component scoring (policy, patterns, risk)" -ForegroundColor Gray
Write-Host "  • Anomaly detection (unusual amounts, high velocity)" -ForegroundColor Gray
Write-Host "  • Risk classification (low/medium/high)" -ForegroundColor Gray
Write-Host "  • Behavioral insights and recommendations" -ForegroundColor Gray
Write-Host "  • Synthetic data generation for demo purposes" -ForegroundColor Gray
Write-Host ""
Write-Host "Risk Levels:" -ForegroundColor Yellow
Write-Host "  • low: score < 0.4" -ForegroundColor Green
Write-Host "  • medium: score 0.4-0.7" -ForegroundColor Yellow
Write-Host "  • high: score > 0.7" -ForegroundColor Red
Write-Host ""
