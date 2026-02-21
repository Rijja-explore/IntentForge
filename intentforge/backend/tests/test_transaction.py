"""
Transaction Validation Tests
Comprehensive tests for deterministic rule engine
"""

import pytest
from uuid import uuid4
from datetime import datetime, timedelta

from app.models.transaction import TransactionCreate, Transaction, TransactionStatus
from app.models.wallet import WalletCreate
from app.models.policy import PolicyCreate, PolicyRules, PolicyType
from app.services.validation_service import validation_service
from app.services.wallet_service import wallet_service
from app.services.policy_service import policy_service


@pytest.fixture
def test_wallet():
    """Create a test wallet"""
    wallet_data = WalletCreate(
        balance=100000.0,
        currency="INR",
        owner="test_transaction_user"
    )
    wallet = wallet_service.create_wallet(wallet_data)
    yield wallet
    # Cleanup
    wallet_service.wallets.pop(wallet.wallet_id, None)


@pytest.fixture
def category_policy(test_wallet):
    """Create a category restriction policy"""
    policy_data = PolicyCreate(
        name="Education Only Policy",
        description="Allow only education-related spending",
        policy_type=PolicyType.CATEGORY_RESTRICTION,
        rules=PolicyRules(
            allowed_categories=["education", "books", "courses"]
        ),
        wallet_id=test_wallet.wallet_id
    )
    policy = policy_service.create_policy(policy_data)
    yield policy
    # Cleanup
    policy_service.policies.pop(policy.policy_id, None)


@pytest.fixture
def amount_limit_policy(test_wallet):
    """Create an amount limit policy"""
    policy_data = PolicyCreate(
        name="Spending Limit Policy",
        description="Maximum 50000 INR spending",
        policy_type=PolicyType.SPENDING_LIMIT,
        rules=PolicyRules(
            max_amount=50000.0
        ),
        wallet_id=test_wallet.wallet_id
    )
    policy = policy_service.create_policy(policy_data)
    yield policy
    # Cleanup
    policy_service.policies.pop(policy.policy_id, None)


@pytest.fixture
def transaction_cap_policy(test_wallet):
    """Create a per-transaction cap policy"""
    policy_data = PolicyCreate(
        name="Transaction Cap Policy",
        description="Maximum 5000 INR per transaction",
        policy_type=PolicyType.TRANSACTION_CAP,
        rules=PolicyRules(
            per_transaction_cap=5000.0
        ),
        wallet_id=test_wallet.wallet_id
    )
    policy = policy_service.create_policy(policy_data)
    yield policy
    # Cleanup
    policy_service.policies.pop(policy.policy_id, None)


@pytest.fixture
def geofence_policy(test_wallet):
    """Create a geo-fence policy"""
    policy_data = PolicyCreate(
        name="Geo Restriction Policy",
        description="Only Delhi and Maharashtra",
        policy_type=PolicyType.GEO_RESTRICTION,
        rules=PolicyRules(
            geo_fence=["IN-DL", "IN-MH"]
        ),
        wallet_id=test_wallet.wallet_id
    )
    policy = policy_service.create_policy(policy_data)
    yield policy
    # Cleanup
    policy_service.policies.pop(policy.policy_id, None)


@pytest.fixture
def expired_policy(test_wallet):
    """Create an expired policy"""
    past_date = datetime.utcnow() - timedelta(days=1)
    policy_data = PolicyCreate(
        name="Expired Policy",
        description="This policy has expired",
        policy_type=PolicyType.SPENDING_LIMIT,
        rules=PolicyRules(
            max_amount=10000.0,
            expiry=past_date
        ),
        wallet_id=test_wallet.wallet_id
    )
    policy = policy_service.create_policy(policy_data)
    yield policy
    # Cleanup
    policy_service.policies.pop(policy.policy_id, None)


# ==================== Category Validation Tests ====================

@pytest.mark.asyncio
async def test_category_match_approved(test_wallet, category_policy):
    """Test: Transaction with allowed category should be APPROVED"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=1000.0,
        category="education",
        merchant="Coursera"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[category_policy]
    )
    
    assert result.status == TransactionStatus.APPROVED
    assert len(result.violations) == 0
    assert category_policy.policy_id in result.policies_evaluated


@pytest.mark.asyncio
async def test_category_mismatch_blocked(test_wallet, category_policy):
    """Test: Transaction with disallowed category should be BLOCKED"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=1000.0,
        category="entertainment",
        merchant="Netflix"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[category_policy]
    )
    
    assert result.status == TransactionStatus.BLOCKED
    assert len(result.violations) > 0
    assert "entertainment" in result.violations[0]
    assert "not in allowed list" in result.violations[0]


# ==================== Amount Limit Tests ====================

@pytest.mark.asyncio
async def test_amount_within_limit_approved(test_wallet, amount_limit_policy):
    """Test: Transaction within max_amount limit should be APPROVED"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=30000.0,
        category="groceries"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[amount_limit_policy]
    )
    
    assert result.status == TransactionStatus.APPROVED
    assert len(result.violations) == 0


@pytest.mark.asyncio
async def test_amount_exceeds_limit_blocked(test_wallet, amount_limit_policy):
    """Test: Transaction exceeding max_amount should be BLOCKED"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=60000.0,
        category="shopping"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[amount_limit_policy]
    )
    
    assert result.status == TransactionStatus.BLOCKED
    assert len(result.violations) > 0
    assert "exceeds maximum limit" in result.violations[0]
    assert "50000" in result.violations[0]


# ==================== Per-Transaction Cap Tests ====================

@pytest.mark.asyncio
async def test_transaction_within_cap_approved(test_wallet, transaction_cap_policy):
    """Test: Transaction within per_transaction_cap should be APPROVED"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=4000.0,
        category="food"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[transaction_cap_policy]
    )
    
    assert result.status == TransactionStatus.APPROVED
    assert len(result.violations) == 0


@pytest.mark.asyncio
async def test_transaction_exceeds_cap_blocked(test_wallet, transaction_cap_policy):
    """Test: Transaction exceeding per_transaction_cap should be BLOCKED"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=6000.0,
        category="electronics"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[transaction_cap_policy]
    )
    
    assert result.status == TransactionStatus.BLOCKED
    assert len(result.violations) > 0
    assert "per-transaction cap" in result.violations[0]
    assert "5000" in result.violations[0]


# ==================== GeoFence Validation Tests ====================

@pytest.mark.asyncio
async def test_geofence_valid_location_approved(test_wallet, geofence_policy):
    """Test: Transaction within geo-fence should be APPROVED"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=1000.0,
        category="shopping",
        location="IN-DL"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[geofence_policy]
    )
    
    assert result.status == TransactionStatus.APPROVED
    assert len(result.violations) == 0


@pytest.mark.asyncio
async def test_geofence_invalid_location_blocked(test_wallet, geofence_policy):
    """Test: Transaction outside geo-fence should be BLOCKED"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=1000.0,
        category="shopping",
        location="IN-KA"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[geofence_policy]
    )
    
    assert result.status == TransactionStatus.BLOCKED
    assert len(result.violations) > 0
    assert "not in allowed geo-fence" in result.violations[0]
    assert "IN-KA" in result.violations[0]


@pytest.mark.asyncio
async def test_geofence_missing_location_blocked(test_wallet, geofence_policy):
    """Test: Transaction without location when geo-fence required should be BLOCKED"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=1000.0,
        category="shopping",
        location=None
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[geofence_policy]
    )
    
    assert result.status == TransactionStatus.BLOCKED
    assert len(result.violations) > 0
    assert "location required" in result.violations[0].lower()


# ==================== Expiry Validation Tests ====================

@pytest.mark.asyncio
async def test_expired_policy_ignored(test_wallet, expired_policy):
    """Test: Expired policies should not block transactions"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=15000.0,  # Exceeds expired policy limit
        category="shopping"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[expired_policy]
    )
    
    # Should be approved because expired policy is ignored
    assert result.status == TransactionStatus.APPROVED
    assert len(result.violations) == 0


# ==================== Multiple Policy Tests ====================

@pytest.mark.asyncio
async def test_multiple_policies_all_pass(test_wallet, category_policy, amount_limit_policy):
    """Test: Transaction passing all policies should be APPROVED"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=10000.0,
        category="education"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[category_policy, amount_limit_policy]
    )
    
    assert result.status == TransactionStatus.APPROVED
    assert len(result.violations) == 0
    assert len(result.policies_evaluated) == 2


@pytest.mark.asyncio
async def test_multiple_policies_one_fails(test_wallet, category_policy, amount_limit_policy):
    """Test: Transaction failing any policy should be BLOCKED"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=10000.0,
        category="entertainment"  # Not in allowed categories
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[category_policy, amount_limit_policy]
    )
    
    assert result.status == TransactionStatus.BLOCKED
    assert len(result.violations) > 0


@pytest.mark.asyncio
async def test_multiple_policies_multiple_failures(test_wallet, category_policy, amount_limit_policy):
    """Test: Transaction failing multiple policies should show all violations"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=60000.0,  # Exceeds limit
        category="entertainment"  # Not allowed
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[category_policy, amount_limit_policy]
    )
    
    assert result.status == TransactionStatus.BLOCKED
    assert len(result.violations) >= 2  # At least 2 violations


# ==================== Complex Scenario Tests ====================

@pytest.mark.asyncio
async def test_complex_policy_combination(test_wallet):
    """Test: Complex scenario with multiple policy types"""
    # Create multiple policies
    policies = []
    
    # Category policy
    cat_policy = PolicyCreate(
        name="Education Cat",
        policy_type=PolicyType.CATEGORY_RESTRICTION,
        rules=PolicyRules(allowed_categories=["education", "books"]),
        wallet_id=test_wallet.wallet_id
    )
    policies.append(policy_service.create_policy(cat_policy))
    
    # Amount limit
    amt_policy = PolicyCreate(
        name="Amount Limit",
        policy_type=PolicyType.SPENDING_LIMIT,
        rules=PolicyRules(max_amount=30000.0),
        wallet_id=test_wallet.wallet_id
    )
    policies.append(policy_service.create_policy(amt_policy))
    
    # Transaction cap
    cap_policy = PolicyCreate(
        name="Per-Txn Cap",
        policy_type=PolicyType.TRANSACTION_CAP,
        rules=PolicyRules(per_transaction_cap=10000.0),
        wallet_id=test_wallet.wallet_id
    )
    policies.append(policy_service.create_policy(cap_policy))
    
    # Geo-fence
    geo_policy = PolicyCreate(
        name="Geo Fence",
        policy_type=PolicyType.GEO_RESTRICTION,
        rules=PolicyRules(geo_fence=["IN-DL"]),
        wallet_id=test_wallet.wallet_id
    )
    policies.append(policy_service.create_policy(geo_policy))
    
    # Valid transaction
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=8000.0,
        category="education",
        location="IN-DL",
        merchant="Udemy"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=policies
    )
    
    assert result.status == TransactionStatus.APPROVED
    assert len(result.violations) == 0
    assert len(result.policies_evaluated) == 4
    
    # Cleanup
    for policy in policies:
        policy_service.policies.pop(policy.policy_id, None)


@pytest.mark.asyncio
async def test_no_policies_approved(test_wallet):
    """Test: Transaction with no policies should be APPROVED"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=99999.0,
        category="anything"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[]
    )
    
    assert result.status == TransactionStatus.APPROVED
    assert len(result.violations) == 0


# ==================== Performance Tests ====================

@pytest.mark.asyncio
async def test_validation_performance(test_wallet, category_policy):
    """Test: Validation should complete in under 100ms"""
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=1000.0,
        category="education"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[category_policy]
    )
    
    # Target: sub-100ms processing
    assert result.processing_time_ms < 100, f"Processing took {result.processing_time_ms}ms (target: <100ms)"


# ==================== Merchant Validation Tests ====================

@pytest.mark.asyncio
async def test_merchant_whitelist_approved(test_wallet):
    """Test: Transaction with whitelisted merchant should be APPROVED"""
    policy_data = PolicyCreate(
        name="Merchant Whitelist",
        policy_type=PolicyType.MERCHANT_WHITELIST,
        rules=PolicyRules(
            merchant_whitelist=["Amazon", "Flipkart", "Udemy"]
        ),
        wallet_id=test_wallet.wallet_id
    )
    policy = policy_service.create_policy(policy_data)
    
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=1000.0,
        category="shopping",
        merchant="Amazon"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[policy]
    )
    
    assert result.status == TransactionStatus.APPROVED
    policy_service.policies.pop(policy.policy_id, None)


@pytest.mark.asyncio
async def test_merchant_whitelist_blocked(test_wallet):
    """Test: Transaction with non-whitelisted merchant should be BLOCKED"""
    policy_data = PolicyCreate(
        name="Merchant Whitelist",
        policy_type=PolicyType.MERCHANT_WHITELIST,
        rules=PolicyRules(
            merchant_whitelist=["Amazon", "Flipkart"]
        ),
        wallet_id=test_wallet.wallet_id
    )
    policy = policy_service.create_policy(policy_data)
    
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=1000.0,
        category="shopping",
        merchant="UnknownStore"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[policy]
    )
    
    assert result.status == TransactionStatus.BLOCKED
    assert "not in whitelist" in result.violations[0]
    policy_service.policies.pop(policy.policy_id, None)


@pytest.mark.asyncio
async def test_merchant_blacklist_blocked(test_wallet):
    """Test: Transaction with blacklisted merchant should be BLOCKED"""
    policy_data = PolicyCreate(
        name="Merchant Blacklist",
        policy_type=PolicyType.MERCHANT_BLACKLIST,
        rules=PolicyRules(
            merchant_blacklist=["GamblingCo", "CryptoExchange"]
        ),
        wallet_id=test_wallet.wallet_id
    )
    policy = policy_service.create_policy(policy_data)
    
    transaction = Transaction(
        wallet_id=test_wallet.wallet_id,
        amount=1000.0,
        category="gambling",
        merchant="GamblingCo"
    )
    
    result = await validation_service.validate_transaction(
        transaction=transaction,
        policies=[policy]
    )
    
    assert result.status == TransactionStatus.BLOCKED
    assert "blacklisted" in result.violations[0]
    policy_service.policies.pop(policy.policy_id, None)
