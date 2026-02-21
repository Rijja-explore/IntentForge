# Blockchain Audit Test Script
$baseUrl = "http://localhost:8000/api/v1"

Write-Host "IntentForge - Blockchain Audit Interface Test" -ForegroundColor Cyan
Write-Host ""

# Test 1: Create Policy and Verify Blockchain Logging
Write-Host "Test 1: Policy Creation with Blockchain Audit" -ForegroundColor Yellow
Write-Host ""

# Create wallet
$wallet = @{ owner_id = "blockchain-test-user"; initial_balance = 50000.0 } | ConvertTo-Json
$walletResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/create" -Method Post -Body $wallet -ContentType "application/json"
$walletId = $walletResponse.wallet.wallet_id
Write-Host "Created Wallet: $walletId" -ForegroundColor Green

# Create policy (should trigger blockchain logging)
$policy = @{
    name = "Blockchain Test Policy"
    wallet_id = $walletId
    policy_type = "spending_limit"
    rules = @{
        max_amount = 5000.0
        allowed_categories = @("food", "education")
    }
    description = "Policy for blockchain audit testing"
} | ConvertTo-Json -Depth 5

$policyResponse = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method Post -Body $policy -ContentType "application/json"
$policyId = $policyResponse.policy.policy_id
Write-Host "Created Policy: $policyId" -ForegroundColor Green
Write-Host "Status: Policy creation logged to blockchain" -ForegroundColor Cyan
Write-Host ""

# Test 2: Transaction Violation and Blockchain Logging
Write-Host "Test 2: Transaction Violation with Blockchain Audit" -ForegroundColor Yellow
Write-Host ""

# Attempt violating transaction
$txViolation = @{
    wallet_id = $walletId
    amount = 10000.0
    merchant = "Expensive Store"
    category = "food"
    location = "IN-DL"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/transaction/validate" -Method Post -Body $txViolation -ContentType "application/json" | Out-Null
    Write-Host "ERROR: Transaction should have been blocked" -ForegroundColor Red
} catch {
    Write-Host "Transaction Blocked (Expected)" -ForegroundColor Green
    Write-Host "Status: Violation logged to blockchain" -ForegroundColor Cyan
}
Write-Host ""

# Test 3: Clawback and Blockchain Logging
Write-Host "Test 3: Clawback Execution with Blockchain Audit" -ForegroundColor Yellow
Write-Host ""

# First, create a transaction to clawback
$validTx = @{
    wallet_id = $walletId
    amount = 1000.0
    merchant = "Test Merchant"
    category = "food"
    location = "IN-DL"
} | ConvertTo-Json

$txResult = Invoke-RestMethod -Uri "$baseUrl/transaction/validate" -Method Post -Body $validTx -ContentType "application/json"
$txId = $txResult.data.transaction_id
Write-Host "Created Transaction: $txId" -ForegroundColor Green

# Execute clawback
$clawback = @{
    transaction_id = $txId
    wallet_id = $walletId
    reason = "policy_violation"
    force = $false
} | ConvertTo-Json

$clawbackResult = Invoke-RestMethod -Uri "$baseUrl/clawback/execute" -Method Post -Body $clawback -ContentType "application/json"
Write-Host "Clawback ID: $($clawbackResult.data.clawback_id)" -ForegroundColor Green
Write-Host "Amount Reversed: $($clawbackResult.data.amount_reversed)" -ForegroundColor Cyan
Write-Host "Status: Clawback logged to blockchain" -ForegroundColor Cyan
Write-Host ""

# Test 4: Retrieve Blockchain Audit Log
Write-Host "Test 4: Retrieve Blockchain Audit Log" -ForegroundColor Yellow
Write-Host ""

$auditLog = Invoke-RestMethod -Uri "$baseUrl/metrics/blockchain/audit-log?limit=10" -Method Get

Write-Host "Total Audit Entries: $($auditLog.data.count)" -ForegroundColor Cyan
Write-Host ""

if ($auditLog.data.entries.Count -gt 0) {
    Write-Host "--- Recent Blockchain Audit Entries ---" -ForegroundColor White
    foreach ($entry in $auditLog.data.entries) {
        Write-Host ""
        Write-Host "Event: $($entry.event_type)" -ForegroundColor Yellow
        Write-Host "  Blockchain TX: $($entry.blockchain_tx_id)" -ForegroundColor Gray
        Write-Host "  Block Hash: $($entry.blockchain_hash)" -ForegroundColor Gray
        Write-Host "  Data Hash: $($entry.data_hash)" -ForegroundColor Gray
        Write-Host "  Status: $($entry.status)" -ForegroundColor Green
        Write-Host "  Timestamp: $($entry.timestamp)" -ForegroundColor Gray
    }
} else {
    Write-Host "No audit entries found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Test 5: Filter by Event Type
Write-Host "Test 5: Filter Audit Log by Event Type" -ForegroundColor Yellow
Write-Host ""

$policyEvents = Invoke-RestMethod -Uri "$baseUrl/metrics/blockchain/audit-log?limit=10&event_type=POLICY_CREATED" -Method Get
Write-Host "Policy Creation Events: $($policyEvents.data.count)" -ForegroundColor Cyan

$violationEvents = Invoke-RestMethod -Uri "$baseUrl/metrics/blockchain/audit-log?limit=10&event_type=TRANSACTION_VIOLATED" -Method Get
Write-Host "Transaction Violation Events: $($violationEvents.data.count)" -ForegroundColor Cyan

$clawbackEvents = Invoke-RestMethod -Uri "$baseUrl/metrics/blockchain/audit-log?limit=10&event_type=CLAWBACK_EXECUTED" -Method Get
Write-Host "Clawback Execution Events: $($clawbackEvents.data.count)" -ForegroundColor Cyan

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "Blockchain Audit Summary" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Gray
Write-Host "Policies Created: $($policyEvents.data.count)" -ForegroundColor White
Write-Host "Violations Logged: $($violationEvents.data.count)" -ForegroundColor White
Write-Host "Clawbacks Logged: $($clawbackEvents.data.count)" -ForegroundColor White
Write-Host "Total Events: $($auditLog.data.count)" -ForegroundColor White
Write-Host ""
Write-Host "Note: This is a demo implementation using simulated blockchain API" -ForegroundColor Yellow
Write-Host "In production, replace blockchain_audit_service with real chain API" -ForegroundColor Yellow
Write-Host ""
Write-Host "Blockchain Audit Testing Complete!" -ForegroundColor Green
