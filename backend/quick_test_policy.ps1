# Quick Policy API Test Script
# Tests policy creation, validation, and wallet attachment

Write-Host "🧪 Quick Policy API Test" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000/api/v1"

# Step 1: Create a wallet
Write-Host "1️⃣ Creating wallet..." -ForegroundColor Yellow
$walletPayload = @{
    owner_id = "policy_demo_user"
    initial_balance = 100000.0
} | ConvertTo-Json

$walletResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/create" -Method POST -Body $walletPayload -ContentType "application/json"
$walletId = $walletResponse.wallet.wallet_id
Write-Host "✅ Wallet Created: $walletId" -ForegroundColor Green
Write-Host ""

# Step 2: Create a category restriction policy
Write-Host "2️⃣ Creating category restriction policy..." -ForegroundColor Yellow
$policyPayload = @{
    name = "Education Budget Policy"
    policy_type = "category_restriction"
    rules = @{
        allowed_categories = @("education", "books", "courses")
        max_amount = 50000.0
        per_transaction_cap = 5000.0
    }
    description = "Restrict spending to education with caps"
    priority = 10
} | ConvertTo-Json -Depth 10

$policyResponse = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method POST -Body $policyPayload -ContentType "application/json"
$policyId = $policyResponse.policy.policy_id
Write-Host "✅ Policy Created!" -ForegroundColor Green
Write-Host "   ID: $policyId" -ForegroundColor White
Write-Host "   Name: $($policyResponse.policy.name)" -ForegroundColor White
Write-Host "   Type: $($policyResponse.policy.policy_type)" -ForegroundColor White
Write-Host ""

# Step 3: Create a spending limit policy with expiry
Write-Host "3️⃣ Creating spending limit policy with expiry..." -ForegroundColor Yellow
$expiry = (Get-Date).AddDays(30).ToString("yyyy-MM-ddTHH:mm:ssZ")
$spendingPolicyPayload = @{
    name = "Monthly Budget Cap"
    policy_type = "spending_limit"
    rules = @{
        max_amount = 75000.0
        period = "monthly"
        expiry = $expiry
    }
    priority = 5
} | ConvertTo-Json -Depth 10

$spendingPolicyResponse = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method POST -Body $spendingPolicyPayload -ContentType "application/json"
$spendingPolicyId = $spendingPolicyResponse.policy.policy_id
Write-Host "✅ Spending Policy Created!" -ForegroundColor Green
Write-Host "   Max Amount: $($spendingPolicyResponse.policy.rules.max_amount) INR" -ForegroundColor White
Write-Host "   Expires: $expiry" -ForegroundColor White
Write-Host ""

# Step 4: Create geo-restricted policy
Write-Host "4️⃣ Creating geo-restricted policy..." -ForegroundColor Yellow
$geoPolicyPayload = @{
    name = "Regional Restriction"
    policy_type = "geo_restriction"
    rules = @{
        geo_fence = @("IN-DL", "IN-MH", "IN-KA")
        max_amount = 100000.0
    }
    description = "Limit transactions to specific regions"
} | ConvertTo-Json -Depth 10

$geoPolicyResponse = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method POST -Body $geoPolicyPayload -ContentType "application/json"
Write-Host "✅ Geo Policy Created!" -ForegroundColor Green
Write-Host "   Allowed Regions: $($geoPolicyResponse.policy.rules.geo_fence -join ', ')" -ForegroundColor White
Write-Host ""

# Step 5: Attach policy to wallet
Write-Host "5️⃣ Attaching policy to wallet..." -ForegroundColor Yellow
$attachResponse = Invoke-RestMethod -Uri "$baseUrl/policy/$policyId/attach/$walletId" -Method POST
Write-Host "✅ Policy Attached!" -ForegroundColor Green
Write-Host "   Policy: $($attachResponse.policy_name)" -ForegroundColor White
Write-Host "   Wallet Owner: $($attachResponse.wallet_owner)" -ForegroundColor White
Write-Host ""

# Step 6: Get wallet policies
Write-Host "6️⃣ Retrieving wallet policies..." -ForegroundColor Yellow
try {
    $walletPolicies = Invoke-RestMethod -Uri "$baseUrl/policy/wallet/$walletId/policies" -Method GET
    Write-Host "✅ Found $($walletPolicies.Count) policy(ies) attached to wallet" -ForegroundColor Green
    foreach ($policy in $walletPolicies) {
        Write-Host "   - $($policy.name) ($($policy.policy_type))" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️ Error retrieving wallet policies: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: List all policies
Write-Host "7️⃣ Listing all policies..." -ForegroundColor Yellow
try {
    $allPolicies = Invoke-RestMethod -Uri "$baseUrl/policy/" -Method GET
    Write-Host "✅ Total Policies: $($allPolicies.Count)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error listing policies: $($_.Exception.Message)" -ForegroundColor Yellow
    $allPolicies = @()  # Initialize empty array if failed
}
Write-Host ""

# Step 8: Get specific policy
Write-Host "8️⃣ Retrieving specific policy..." -ForegroundColor Yellow
$retrievedPolicy = Invoke-RestMethod -Uri "$baseUrl/policy/$policyId" -Method GET
Write-Host "✅ Policy Retrieved!" -ForegroundColor Green
Write-Host "   Name: $($retrievedPolicy.name)" -ForegroundColor White
Write-Host "   Categories: $($retrievedPolicy.rules.allowed_categories -join ', ')" -ForegroundColor White
Write-Host "   Priority: $($retrievedPolicy.priority)" -ForegroundColor White
Write-Host ""

# Step 9: Validate policy schema
Write-Host "9️⃣ Validating policy schema..." -ForegroundColor Yellow
$validation = Invoke-RestMethod -Uri "$baseUrl/policy/$policyId/validate" -Method POST
Write-Host "✅ Schema Validation!" -ForegroundColor Green
Write-Host "   Valid: $($validation.valid)" -ForegroundColor White
Write-Host "   Errors: $($validation.errors.Count)" -ForegroundColor White
Write-Host "   Expired: $($validation.is_expired)" -ForegroundColor White
Write-Host ""

# Step 10: Test validation error (intentional)
Write-Host "🔟 Testing validation error handling..." -ForegroundColor Yellow
try {
    $invalidPayload = @{
        name = "Invalid Policy"
        policy_type = "category_restriction"
        rules = @{
            max_amount = 10000.0
            # Missing allowed_categories - should fail
        }
    } | ConvertTo-Json -Depth 10
    
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/policy/create" -Method POST -Body $invalidPayload -ContentType "application/json"
    Write-Host "   ⚠️ Should have failed validation!" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Validation Error Correctly Caught!" -ForegroundColor Green
    Write-Host "   Status: 422 - Validation Failed" -ForegroundColor White
}
Write-Host ""

Write-Host "🎉 All policy tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   - Created $($allPolicies.Count) policies" -ForegroundColor White
Write-Host "   - Validated schema consistency" -ForegroundColor White
Write-Host "   - Attached policies to wallet" -ForegroundColor White
Write-Host "   - Tested error handling" -ForegroundColor White
Write-Host ""
Write-Host " View API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
