# Stress Test Script
$baseUrl = "http://localhost:8000/api/v1"

Write-Host "IntentForge - Stress Test & Performance Validation" -ForegroundColor Cyan
Write-Host ""

# Create test wallet
Write-Host "Setting up test wallet..." -ForegroundColor Yellow
$wallet = @{ owner_id = "stress-test-user"; initial_balance = 100000.0 } | ConvertTo-Json
$walletResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/create" -Method Post -Body $wallet -ContentType "application/json"
$walletId = $walletResponse.wallet.wallet_id
Write-Host "Wallet ID: $walletId" -ForegroundColor Green
Write-Host ""

# Create test policy
Write-Host "Setting up test policy..." -ForegroundColor Yellow
$policy = @{
    name = "Stress Test Policy"
    wallet_id = $walletId
    policy_type = "spending_limit"
    rules = @{
        allowed_categories = @("food", "shopping", "education")
        max_amount = 5000.0
        per_transaction_cap = 1000.0
    }
} | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method Post -Body $policy -ContentType "application/json" | Out-Null
Write-Host "Policy created" -ForegroundColor Green
Write-Host ""

# Test 1: Sequential Stress Test (100 transactions)
Write-Host "Test 1: Sequential Stress Test - 100 Transactions" -ForegroundColor Cyan
Write-Host "Running..." -ForegroundColor Yellow
$stressTest = Invoke-RestMethod -Uri "$baseUrl/metrics/stress-test?wallet_id=$walletId&num_transactions=100&concurrent=false" -Method Post

Write-Host ""
Write-Host "--- Test Summary ---" -ForegroundColor White
Write-Host "Total Transactions: $($stressTest.data.test_summary.total_transactions)" -ForegroundColor Gray
Write-Host "Successful: $($stressTest.data.test_summary.successful_transactions)" -ForegroundColor Green
Write-Host "Failed: $($stressTest.data.test_summary.failed_transactions)" -ForegroundColor Gray
Write-Host "Success Rate: $($stressTest.data.test_summary.success_rate)%" -ForegroundColor Gray

Write-Host ""
Write-Host "--- Validation Results ---" -ForegroundColor White
Write-Host "Approved: $($stressTest.data.validation_results.approved)" -ForegroundColor Green
Write-Host "Blocked: $($stressTest.data.validation_results.blocked)" -ForegroundColor Yellow
Write-Host "Approval Rate: $($stressTest.data.validation_results.approval_rate)%" -ForegroundColor Gray

Write-Host ""
Write-Host "--- Performance Metrics ---" -ForegroundColor White
Write-Host "Total Duration: $($stressTest.data.performance_metrics.total_duration_seconds) seconds" -ForegroundColor Gray
Write-Host "Throughput: $($stressTest.data.performance_metrics.throughput_tps) TPS" -ForegroundColor Cyan
Write-Host "Average Latency: $($stressTest.data.performance_metrics.average_latency_ms) ms" -ForegroundColor Gray
Write-Host "Median Latency: $($stressTest.data.performance_metrics.median_latency_ms) ms" -ForegroundColor Gray
Write-Host "Min Latency: $($stressTest.data.performance_metrics.min_latency_ms) ms" -ForegroundColor Gray
Write-Host "Max Latency: $($stressTest.data.performance_metrics.max_latency_ms) ms" -ForegroundColor Gray
Write-Host "Std Dev: $($stressTest.data.performance_metrics.std_dev_latency_ms) ms" -ForegroundColor Gray

Write-Host ""
Write-Host "--- Latency Percentiles ---" -ForegroundColor White
Write-Host "P50: $($stressTest.data.latency_percentiles.p50_ms) ms" -ForegroundColor Gray
Write-Host "P95: $($stressTest.data.latency_percentiles.p95_ms) ms" -ForegroundColor Gray
Write-Host "P99: $($stressTest.data.latency_percentiles.p99_ms) ms" -ForegroundColor Gray

Write-Host ""
Write-Host "--- Target Compliance ---" -ForegroundColor White
$meetsTarget = $stressTest.data.target_compliance.sub_100ms_target
if ($meetsTarget) {
    Write-Host "Sub-100ms Target: PASSED" -ForegroundColor Green
} else {
    Write-Host "Sub-100ms Target: NOT MET" -ForegroundColor Red
}
Write-Host "Average < 100ms: $($stressTest.data.target_compliance.meets_average)" -ForegroundColor Gray
Write-Host "P95 < 100ms: $($stressTest.data.target_compliance.meets_p95)" -ForegroundColor Gray

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Test 2: Concurrent Stress Test (100 transactions)
Write-Host "Test 2: Concurrent Stress Test - 100 Transactions" -ForegroundColor Cyan
Write-Host "Running..." -ForegroundColor Yellow
$concurrentTest = Invoke-RestMethod -Uri "$baseUrl/metrics/stress-test?wallet_id=$walletId&num_transactions=100&concurrent=true" -Method Post

Write-Host ""
Write-Host "--- Concurrent Test Results ---" -ForegroundColor White
Write-Host "Throughput: $($concurrentTest.data.performance_metrics.throughput_tps) TPS" -ForegroundColor Cyan
Write-Host "Average Latency: $($concurrentTest.data.performance_metrics.average_latency_ms) ms" -ForegroundColor Gray
Write-Host "P95 Latency: $($concurrentTest.data.latency_percentiles.p95_ms) ms" -ForegroundColor Gray

$meetsTargetConcurrent = $concurrentTest.data.target_compliance.sub_100ms_target
if ($meetsTargetConcurrent) {
    Write-Host "Sub-100ms Target: PASSED" -ForegroundColor Green
} else {
    Write-Host "Sub-100ms Target: NOT MET" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Comparison
Write-Host "Performance Comparison" -ForegroundColor Yellow
Write-Host "Sequential TPS: $($stressTest.data.performance_metrics.throughput_tps)" -ForegroundColor Gray
Write-Host "Concurrent TPS: $($concurrentTest.data.performance_metrics.throughput_tps)" -ForegroundColor Gray
$improvement = ($concurrentTest.data.performance_metrics.throughput_tps / $stressTest.data.performance_metrics.throughput_tps - 1) * 100
Write-Host "Improvement: +$($improvement.ToString('0.00'))%" -ForegroundColor Cyan

Write-Host ""
Write-Host "Stress Testing Complete!" -ForegroundColor Green
