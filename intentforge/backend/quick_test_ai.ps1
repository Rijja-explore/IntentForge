# ============================================================================
# IntentForge - AI Features Test Script
# Tests: Intent Parsing, AI Health Check, Supported Categories
# ============================================================================

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:8000/api/v1"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  IntentForge - AI & Intent Parsing Test Suite" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# Test 1: AI Health Check
# ============================================================================
Write-Host "`[TEST 1`] AI Service Health Check" -ForegroundColor Yellow
Write-Host "GET $baseUrl/ai/health" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/health" -Method Get -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Service: $($response.data.service)" -ForegroundColor Gray
    Write-Host "  Status: $($response.data.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 2: Get Supported Categories
# ============================================================================
Write-Host "`[TEST 2`] Get Supported Categories" -ForegroundColor Yellow
Write-Host "GET $baseUrl/ai/supported-categories" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/supported-categories" -Method Get -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Categories: $($response.data.categories -join ', ')" -ForegroundColor Gray
    Write-Host "  Locations: $($response.data.locations -join ', ')" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 3: Parse Intent - Education Spending Limit
# ============================================================================
Write-Host "`[TEST 3`] Parse Intent - Education Spending Limit" -ForegroundColor Yellow
$intentRequest = @{
    user_input = "Block any spending above 5k rupees on education in Delhi"
} | ConvertTo-Json -Depth 10

Write-Host "POST $baseUrl/ai/parse-intent" -ForegroundColor Gray
Write-Host "Input: Block any spending above 5k rupees on education in Delhi" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/parse-intent" -Method Post -Body $intentRequest -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Confidence: $($response.data.confidence)" -ForegroundColor Gray
    Write-Host "  Requires Review: $($response.data.requires_review)" -ForegroundColor Gray
    Write-Host "  Policy Name: $($response.data.policy.name)" -ForegroundColor Gray
    Write-Host "  Max Amount: $($response.data.policy.max_amount)" -ForegroundColor Gray
    Write-Host "  Categories: $($response.data.policy.categories -join ', ')" -ForegroundColor Gray
    Write-Host "  Locations: $($response.data.policy.allowed_locations -join ', ')" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 4: Parse Intent - Food Budget
# ============================================================================
Write-Host "`[TEST 4`] Parse Intent - Food Budget" -ForegroundColor Yellow
$intentRequest = @{
    user_input = "Allow only 2000 rupees for food and groceries shopping per day"
} | ConvertTo-Json -Depth 10

Write-Host "POST $baseUrl/ai/parse-intent" -ForegroundColor Gray
Write-Host "Input: Allow only 2000 rupees for food and groceries shopping per day" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/parse-intent" -Method Post -Body $intentRequest -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Confidence: $($response.data.confidence)" -ForegroundColor Gray
    Write-Host "  Requires Review: $($response.data.requires_review)" -ForegroundColor Gray
    Write-Host "  Policy Name: $($response.data.policy.name)" -ForegroundColor Gray
    Write-Host "  Max Amount: $($response.data.policy.max_amount)" -ForegroundColor Gray
    Write-Host "  Categories: $($response.data.policy.categories -join ', ')" -ForegroundColor Gray
    Write-Host "  Daily Limit: $($response.data.policy.daily_limit)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 5: Parse Intent - Multi-Location Shopping
# ============================================================================
Write-Host "`[TEST 5`] Parse Intent - Multi-Location Shopping" -ForegroundColor Yellow
$intentRequest = @{
    user_input = "Allow shopping and entertainment in Mumbai and Bangalore up to 10000 rupees"
} | ConvertTo-Json -Depth 10

Write-Host "POST $baseUrl/ai/parse-intent" -ForegroundColor Gray
Write-Host "Input: Allow shopping and entertainment in Mumbai and Bangalore up to 10000 rupees" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/parse-intent" -Method Post -Body $intentRequest -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Confidence: $($response.data.confidence)" -ForegroundColor Gray
    Write-Host "  Requires Review: $($response.data.requires_review)" -ForegroundColor Gray
    Write-Host "  Policy Name: $($response.data.policy.name)" -ForegroundColor Gray
    Write-Host "  Max Amount: $($response.data.policy.max_amount)" -ForegroundColor Gray
    Write-Host "  Categories: $($response.data.policy.categories -join ', ')" -ForegroundColor Gray
    Write-Host "  Locations: $($response.data.policy.allowed_locations -join ', ')" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 6: Parse Intent - Healthcare Merchant
# ============================================================================
Write-Host "`[TEST 6`] Parse Intent - Healthcare Merchant" -ForegroundColor Yellow
$intentRequest = @{
    user_input = "Block healthcare payments to Apollo Hospital above 50000"
} | ConvertTo-Json -Depth 10

Write-Host "POST $baseUrl/ai/parse-intent" -ForegroundColor Gray
Write-Host "Input: Block healthcare payments to Apollo Hospital above 50000" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/parse-intent" -Method Post -Body $intentRequest -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Confidence: $($response.data.confidence)" -ForegroundColor Gray
    Write-Host "  Requires Review: $($response.data.requires_review)" -ForegroundColor Gray
    Write-Host "  Policy Name: $($response.data.policy.name)" -ForegroundColor Gray
    Write-Host "  Max Amount: $($response.data.policy.max_amount)" -ForegroundColor Gray
    Write-Host "  Categories: $($response.data.policy.categories -join ', ')" -ForegroundColor Gray
    Write-Host "  Blocked Merchants: $($response.data.policy.blocked_merchants -join ', ')" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 7: Parse Intent - Time-Based Restriction
# ============================================================================
Write-Host "`[TEST 7`] Parse Intent - Time-Based Restriction" -ForegroundColor Yellow
$intentRequest = @{
    user_input = "No entertainment spending from Monday to Friday"
} | ConvertTo-Json -Depth 10

Write-Host "POST $baseUrl/ai/parse-intent" -ForegroundColor Gray
Write-Host "Input: No entertainment spending from Monday to Friday" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/parse-intent" -Method Post -Body $intentRequest -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Confidence: $($response.data.confidence)" -ForegroundColor Gray
    Write-Host "  Requires Review: $($response.data.requires_review)" -ForegroundColor Gray
    Write-Host "  Policy Name: $($response.data.policy.name)" -ForegroundColor Gray
    Write-Host "  Categories: $($response.data.policy.categories -join ', ')" -ForegroundColor Gray
    Write-Host "  Time Restriction: $($response.data.policy.time_restrictions.description)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 8: Parse Intent - Ambiguous Input (Should Reject)
# ============================================================================
Write-Host "`[TEST 8`] Parse Intent - Ambiguous Input (Should Reject)" -ForegroundColor Yellow
$intentRequest = @{
    user_input = "Maybe limit something somewhere sometimes"
} | ConvertTo-Json -Depth 10

Write-Host "POST $baseUrl/ai/parse-intent" -ForegroundColor Gray
Write-Host "Input: Maybe limit something somewhere sometimes" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/parse-intent" -Method Post -Body $intentRequest -ContentType "application/json"
    Write-Host "✗ Should have been rejected due to low confidence" -ForegroundColor Red
    Write-Host ""
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Status: REJECTED (Expected)" -ForegroundColor Green
    Write-Host "  Error: $($errorResponse.error)" -ForegroundColor Gray
    Write-Host "  Message: $($errorResponse.message)" -ForegroundColor Gray
    Write-Host ""
}

# ============================================================================
# Test 9: Parse Intent - INR Format (Lakh)
# ============================================================================
Write-Host "`[TEST 9`] Parse Intent - INR Format (Lakh)" -ForegroundColor Yellow
$intentRequest = @{
    user_input = "Block any shopping above 2 lakh rupees"
} | ConvertTo-Json -Depth 10

Write-Host "POST $baseUrl/ai/parse-intent" -ForegroundColor Gray
Write-Host "Input: Block any shopping above 2 lakh rupees" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/parse-intent" -Method Post -Body $intentRequest -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Confidence: $($response.data.confidence)" -ForegroundColor Gray
    Write-Host "  Max Amount: $($response.data.policy.max_amount) (Should be 200000)" -ForegroundColor Gray
    Write-Host "  Categories: $($response.data.policy.categories -join ', ')" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test 10: Parse Intent - Transport in Specific City
# ============================================================================
Write-Host "`[TEST 10`] Parse Intent - Transport in Specific City" -ForegroundColor Yellow
$intentRequest = @{
    user_input = "Allow transport spending only in Pune, max 1500 per day"
} | ConvertTo-Json -Depth 10

Write-Host "POST $baseUrl/ai/parse-intent" -ForegroundColor Gray
Write-Host "Input: Allow transport spending only in Pune, max 1500 per day" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/parse-intent" -Method Post -Body $intentRequest -ContentType "application/json"
    Write-Host "✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Confidence: $($response.data.confidence)" -ForegroundColor Gray
    Write-Host "  Policy Name: $($response.data.policy.name)" -ForegroundColor Gray
    Write-Host "  Max Amount: $($response.data.policy.max_amount)" -ForegroundColor Gray
    Write-Host "  Categories: $($response.data.policy.categories -join ', ')" -ForegroundColor Gray
    Write-Host "  Locations: $($response.data.policy.allowed_locations -join ', ')" -ForegroundColor Gray
    Write-Host "  Daily Limit: $($response.data.policy.daily_limit)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ============================================================================
# Test Summary
# ============================================================================
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  AI Test Suite Completed" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tests covered:" -ForegroundColor White
Write-Host "  ✓ AI service health check" -ForegroundColor Gray
Write-Host "  ✓ Supported categories and locations listing" -ForegroundColor Gray
Write-Host "  ✓ Education spending limit parsing" -ForegroundColor Gray
Write-Host "  ✓ Food budget with daily limit" -ForegroundColor Gray
Write-Host "  ✓ Multi-location shopping policy" -ForegroundColor Gray
Write-Host "  ✓ Healthcare merchant blocking" -ForegroundColor Gray
Write-Host "  ✓ Time-based restrictions" -ForegroundColor Gray
Write-Host "  ✓ Ambiguous input rejection (low confidence)" -ForegroundColor Gray
Write-Host "  ✓ INR format parsing (lakh)" -ForegroundColor Gray
Write-Host "  ✓ Transport with daily limit and location" -ForegroundColor Gray
Write-Host ""
Write-Host "Notes:" -ForegroundColor Yellow
Write-Host "  • Confidence scores above 0.6 are accepted" -ForegroundColor Gray
Write-Host "  • requires_review=true for scores between 0.6-0.8" -ForegroundColor Gray
Write-Host "  • AI uses deterministic pattern matching for reproducibility" -ForegroundColor Gray
Write-Host "  • Supports INR formats: 5k, 5000, 2 lakh, ₹5000" -ForegroundColor Gray
Write-Host ""
