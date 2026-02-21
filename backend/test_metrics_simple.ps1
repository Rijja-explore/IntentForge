# Simple Metrics Test Script
$baseUrl = "http://localhost:8000/api/v1"

Write-Host "Testing ML & Metrics Features..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Metrics Health Check
Write-Host "Test 1: Metrics Health Check" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/metrics/health" -Method Get
Write-Host "Status: $($response.data.status)" -ForegroundColor Green
Write-Host ""

# Create a test wallet
Write-Host "Creating test wallet..." -ForegroundColor Yellow
$wallet = @{ owner_id = "test-user"; initial_balance = 50000.0 } | ConvertTo-Json
$walletResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/create" -Method Post -Body $wallet -ContentType "application/json"
$walletId = $walletResponse.wallet.wallet_id
Write-Host "Wallet ID: $walletId" -ForegroundColor Green
Write-Host ""

# Create a test policy
Write-Host "Creating test policy..." -ForegroundColor Yellow
$policy = @{
    name = "Test Policy"
    wallet_id = $walletId
    policy_type = "spending_limit"
    rules = @{
        allowed_categories = @("shopping", "food")
        max_amount = 10000.0
        per_transaction_cap = 5000.0
    }
    description = "Test policy for metrics"
} | ConvertTo-Json -Depth 5
$policyResponse = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method Post -Body $policy -ContentType "application/json"
Write-Host "Policy created" -ForegroundColor Green
Write-Host ""

# Test 2: Compliance Score
Write-Host "Test 2: Get Compliance Score" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/metrics/compliance?wallet_id=$walletId" -Method Get
Write-Host "Compliance Score: $($response.data.compliance_score)" -ForegroundColor Green
Write-Host "Risk Level: $($response.data.risk_level)" -ForegroundColor Green
Write-Host "Anomalies: $($response.data.anomalies.Count)" -ForegroundColor Green
Write-Host ""

# Test 3: Risk Analysis
Write-Host "Test 3: Get Risk Analysis" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/metrics/wallet/$walletId/risk-analysis" -Method Get
Write-Host "Risk Score: $($response.data.risk_score)" -ForegroundColor Green
Write-Host "Risk Level: $($response.data.risk_level)" -ForegroundColor Green
Write-Host ""

# Note: Cleanup not implemented (no delete endpoint)
Write-Host "Test complete (wallet remains for inspection)" -ForegroundColor Gray
Write-Host ""

Write-Host "ML/Metrics Tests Complete!" -ForegroundColor Cyan
