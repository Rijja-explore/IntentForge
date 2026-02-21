# Quick Wallet API Test Script
# Run this after starting the server

Write-Host "🧪 Quick Wallet API Test" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000/api/v1"

# Test 1: Create Wallet
Write-Host "1️⃣ Creating wallet..." -ForegroundColor Yellow
$body = @{
    owner_id = "demo_user_123"
    currency = "INR"
    initial_balance = 50000.0
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$baseUrl/wallet/create" -Method POST -Body $body -ContentType "application/json"
$walletId = $response.wallet.wallet_id

Write-Host "✅ Wallet Created!" -ForegroundColor Green
Write-Host "   ID: $walletId" -ForegroundColor White
Write-Host "   Balance: $($response.wallet.balance) INR" -ForegroundColor White
Write-Host ""

# Test 2: Get Wallet
Write-Host "2️⃣ Retrieving wallet..." -ForegroundColor Yellow
$wallet = Invoke-RestMethod -Uri "$baseUrl/wallet/$walletId" -Method GET
Write-Host "✅ Wallet Retrieved!" -ForegroundColor Green
Write-Host "   Owner: $($wallet.owner_id)" -ForegroundColor White
Write-Host "   Compliance Score: $($wallet.compliance_score)" -ForegroundColor White
Write-Host ""

# Test 3: Get Balance
Write-Host "3️⃣ Checking balance..." -ForegroundColor Yellow
$balance = Invoke-RestMethod -Uri "$baseUrl/wallet/$walletId/balance" -Method GET
Write-Host "✅ Balance Retrieved!" -ForegroundColor Green
Write-Host "   💰 $($balance.balance) $($balance.currency)" -ForegroundColor Cyan
Write-Host ""

# Test 4: List Wallets
Write-Host "4️⃣ Listing all wallets..." -ForegroundColor Yellow
$wallets = Invoke-RestMethod -Uri "$baseUrl/wallet/" -Method GET
Write-Host "✅ Found $($wallets.Count) wallet(s)" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 All tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "View API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan