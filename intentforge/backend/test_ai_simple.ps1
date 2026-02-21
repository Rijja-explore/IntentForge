# Simple AI Test Script
$baseUrl = "http://localhost:8000/api/v1"

Write-Host "Testing AI Features..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: AI Health Check" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/ai/health" -Method Get
Write-Host "Status: $($response.data.status)" -ForegroundColor Green
Write-Host ""

# Test 2: Supported Categories
Write-Host "Test 2: Supported Categories" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/ai/supported-categories" -Method Get
Write-Host "Categories: $($response.data.categories -join ', ')" -ForegroundColor Green
Write-Host ""

# Test 3: Parse Intent
Write-Host "Test 3: Parse Intent - Education Limit" -ForegroundColor Yellow
$intent = @{ user_input = "Block any spending above 5000 rupees on education in Delhi" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$baseUrl/ai/parse-intent" -Method Post -Body $intent -ContentType "application/json"
Write-Host "Confidence: $($response.data.confidence)" -ForegroundColor Green
Write-Host "Policy Name: $($response.data.policy.name)" -ForegroundColor Green
Write-Host "Max Amount: $($response.data.policy.max_amount)" -ForegroundColor Green
Write-Host ""

# Test 4: Parse Intent with multiple categories
Write-Host "Test 4: Parse Intent - Food Budget" -ForegroundColor Yellow
$intent = @{ user_input = "Allow only 2000 rupees for food per day" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$baseUrl/ai/parse-intent" -Method Post -Body $intent -ContentType "application/json"
Write-Host "Confidence: $($response.data.confidence)" -ForegroundColor Green
Write-Host "Daily Limit: $($response.data.policy.daily_limit)" -ForegroundColor Green
Write-Host ""

Write-Host "AI Tests Complete!" -ForegroundColor Cyan
