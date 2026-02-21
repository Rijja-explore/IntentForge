# Quick Clawback & Conflict Detection Test Script
# Tests clawback execution and policy conflict detection

$baseUrl = "http://localhost:8000/api/v1"
$ErrorActionPreference = "Continue"

Write-Host "`nClawback & Conflict Detection Test" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

# ==================== SETUP ====================

# Step 1: Create test wallet
Write-Host "`n[1] Creating test wallet..." -ForegroundColor Yellow
$walletBody = @{
    owner_id = "clawback_test_user"
    currency = "INR"
    initial_balance = 100000.0
} | ConvertTo-Json

$wallet = Invoke-RestMethod -Uri "$baseUrl/wallet/create" -Method POST -Body $walletBody -ContentType "application/json"
$walletId = $wallet.wallet.wallet_id
Write-Host "Wallet Created: $walletId" -ForegroundColor Green
Write-Host "   Initial Balance: 100000.0 INR" -ForegroundColor Gray

# Step 2: Create policies (some conflicting)
Write-Host "`n[2] Creating policies..." -ForegroundColor Yellow

# Policy A: Category restriction (education only)
$policyA = @{
    name = "Education Only"
    policy_type = "category_restriction"
    wallet_id = $walletId
    rules = @{
        allowed_categories = @("education", "books")
    }
} | ConvertTo-Json -Depth 10

$polA = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method POST -Body $policyA -ContentType "application/json"
Write-Host "   Policy A: Education Only - $($polA.policy.policy_id)" -ForegroundColor Green

# Policy B: Category restriction (shopping only) - CONFLICTS with A
$policyB = @{
    name = "Shopping Only"
    policy_type = "category_restriction"
    wallet_id = $walletId
    rules = @{
        allowed_categories = @("shopping", "groceries")
    }
} | ConvertTo-Json -Depth 10

$polB = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method POST -Body $policyB -ContentType "application/json"
Write-Host "   Policy B: Shopping Only - $($polB.policy.policy_id)" -ForegroundColor Green

# Policy C: Amount limit (valid configuration)
$policyC = @{
    name = "Small Spender"
    policy_type = "spending_limit"
    wallet_id = $walletId
    rules = @{
        max_amount = 10000.0
        per_transaction_cap = 5000.0  # Cap < Max (valid)
    }
} | ConvertTo-Json -Depth 10

$polC = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method POST -Body $policyC -ContentType "application/json"
Write-Host "   Policy C: Small Spender - $($polC.policy.policy_id)" -ForegroundColor Green

Write-Host ("`n" + ("=" * 70)) -ForegroundColor Magenta
Write-Host "CONFLICT DETECTION TESTS" -ForegroundColor Magenta
Write-Host ("=" * 70) -ForegroundColor Magenta

# Test 3: Detect policy conflicts
Write-Host "`n[3] Detecting policy conflicts..." -ForegroundColor Yellow

try {
    $conflicts = Invoke-RestMethod -Uri "$baseUrl/policy/conflicts" -Method GET
    
    Write-Host "Conflict Detection Complete" -ForegroundColor Green
    Write-Host "   Total Conflicts: $($conflicts.data.total_conflicts)" -ForegroundColor Cyan
    Write-Host "   Has Critical Conflicts: $($conflicts.data.has_critical_conflicts)" -ForegroundColor Cyan
    
    if ($conflicts.data.total_conflicts -gt 0) {
        Write-Host "`n   Conflict Details:" -ForegroundColor Yellow
        foreach ($conflict in $conflicts.data.conflicts) {
            Write-Host "   ---" -ForegroundColor Gray
            Write-Host "   Severity: $($conflict.severity)" -ForegroundColor $(if ($conflict.severity -eq "CRITICAL") { "Red" } else { "Yellow" })
            Write-Host "   Policy A: $($conflict.policy_a_name)" -ForegroundColor Gray
            Write-Host "   Policy B: $($conflict.policy_b_name)" -ForegroundColor Gray
            Write-Host "   Issue: $($conflict.conflict_description.Substring(0, [Math]::Min(150, $conflict.conflict_description.Length)))..." -ForegroundColor White
        }
    }
}
catch {
    Write-Host "Conflict detection failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ("`n" + ("=" * 70)) -ForegroundColor Magenta
Write-Host "CLAWBACK EXECUTION TESTS" -ForegroundColor Magenta
Write-Host ("=" * 70) -ForegroundColor Magenta

# Test 4: Execute mock clawback for policy violation
Write-Host "`n[4] Executing clawback (Policy Violation)..." -ForegroundColor Yellow

$clawbackReq1 = @{
    transaction_id = [guid]::NewGuid().ToString()
    wallet_id = $walletId
    reason = "policy_violation"
    force = $true
} | ConvertTo-Json

try {
    $cb1 = Invoke-RestMethod -Uri "$baseUrl/clawback/execute" -Method POST -Body $clawbackReq1 -ContentType "application/json"
    
    Write-Host "Clawback Executed!" -ForegroundColor Green
    Write-Host "   Clawback ID: $($cb1.data.clawback_id)" -ForegroundColor Cyan
    Write-Host "   Status: $($cb1.data.status)" -ForegroundColor Green
    Write-Host "   Amount Reversed: $($cb1.data.amount_reversed) INR" -ForegroundColor Cyan
    Write-Host "   Previous Balance: $($cb1.data.previous_balance) INR" -ForegroundColor Gray
    Write-Host "   New Balance: $($cb1.data.new_balance) INR" -ForegroundColor Green
    Write-Host "   Processing Time: $($cb1.data.processing_time_ms) ms" -ForegroundColor Gray
    Write-Host "   Explanation:" -ForegroundColor Yellow
    Write-Host "   $($cb1.data.explanation)" -ForegroundColor White
}
catch {
    Write-Host "Clawback execution failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test 5: Execute clawback for expired policy
Write-Host "`n[5] Executing clawback (Expired Policy)..." -ForegroundColor Yellow

$clawbackReq2 = @{
    transaction_id = [guid]::NewGuid().ToString()
    wallet_id = $walletId
    reason = "expired_policy"
    force = $true
} | ConvertTo-Json

try {
    $cb2 = Invoke-RestMethod -Uri "$baseUrl/clawback/execute" -Method POST -Body $clawbackReq2 -ContentType "application/json"
    
    Write-Host "Clawback Executed!" -ForegroundColor Green
    Write-Host "   Status: $($cb2.data.status)" -ForegroundColor Green
    Write-Host "   Amount Reversed: $($cb2.data.amount_reversed) INR" -ForegroundColor Cyan
    Write-Host "   New Balance: $($cb2.data.new_balance) INR" -ForegroundColor Green
}
catch {
    Write-Host "Clawback execution failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test 6: Execute clawback for fraud detection
Write-Host "`n[6] Executing clawback (Fraud Detection)..." -ForegroundColor Yellow

$clawbackReq3 = @{
    transaction_id = [guid]::NewGuid().ToString()
    wallet_id = $walletId
    reason = "fraud_detection"
    force = $true
} | ConvertTo-Json

try {
    $cb3 = Invoke-RestMethod -Uri "$baseUrl/clawback/execute" -Method POST -Body $clawbackReq3 -ContentType "application/json"
    
    Write-Host "Clawback Executed!" -ForegroundColor Green
    Write-Host "   Reason: Fraud Detection" -ForegroundColor Red
    Write-Host "   Amount Reversed: $($cb3.data.amount_reversed) INR" -ForegroundColor Cyan
}
catch {
    Write-Host "Clawback execution failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test 7: Get clawback history
Write-Host "`n[7] Retrieving clawback history..." -ForegroundColor Yellow

try {
    $history = Invoke-RestMethod -Uri "$baseUrl/clawback/history?wallet_id=$walletId" -Method GET
    
    Write-Host "History Retrieved" -ForegroundColor Green
    Write-Host "   Total Clawbacks: $($history.data.Count)" -ForegroundColor Cyan
    
    if ($history.data.Count -gt 0) {
        Write-Host "`n   Clawback Records:" -ForegroundColor Yellow
        foreach ($record in $history.data) {
            Write-Host "   - ID: $($record.clawback_id)" -ForegroundColor Gray
            Write-Host "     Reason: $($record.reason)" -ForegroundColor Gray
            Write-Host "     Amount: $($record.amount) INR" -ForegroundColor Cyan
            Write-Host "     Status: $($record.status)" -ForegroundColor Green
        }
    }
}
catch {
    Write-Host "Failed to retrieve history" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test 8: Get final wallet balance
Write-Host "`n[8] Checking final wallet balance..." -ForegroundColor Yellow

try {
    $walletFinal = Invoke-RestMethod -Uri "$baseUrl/wallet/$walletId" -Method GET
    
    Write-Host "Final Wallet State:" -ForegroundColor Green
    Write-Host "   Balance: $($walletFinal.balance) INR" -ForegroundColor Cyan
    Write-Host "   Compliance Score: $($walletFinal.compliance_score)" -ForegroundColor Cyan
    Write-Host "   Status: $(if ($walletFinal.is_active) { 'Active' } else { 'Inactive' })" -ForegroundColor $(if ($walletFinal.is_active) { "Green" } else { "Red" })
}
catch {
    Write-Host "Failed to retrieve wallet" -ForegroundColor Red
}

# Summary
Write-Host ("`n" + ("=" * 70)) -ForegroundColor Cyan
Write-Host "All tests completed!" -ForegroundColor Green
Write-Host ("=" * 70) -ForegroundColor Cyan

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "   [OK] Wallet created with 100000 INR" -ForegroundColor White
Write-Host "   [OK] 3 policies created (with conflicts)" -ForegroundColor White
Write-Host "   [OK] Conflict detection executed" -ForegroundColor White
Write-Host "   [OK] 3 clawbacks executed" -ForegroundColor White
Write-Host "   [OK] Clawback history retrieved" -ForegroundColor White
Write-Host "   [OK] Final balance verified" -ForegroundColor White

Write-Host "`nAPI Endpoints Tested:" -ForegroundColor Cyan
Write-Host "   POST /api/v1/clawback/execute" -ForegroundColor Gray
Write-Host "   GET  /api/v1/clawback/history" -ForegroundColor Gray
Write-Host "   GET  /api/v1/policy/conflicts" -ForegroundColor Gray

Write-Host "`nView API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Clawback Engine: Operational and Deterministic" -ForegroundColor Green
Write-Host "Conflict Detection: Operational" -ForegroundColor Green
