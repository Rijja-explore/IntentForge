"""
AI Explanation Generator Service
Produces human-readable reasoning for transaction decisions
"""

from typing import Dict, Any, List
from app.models.transaction import ValidationResult
from app.models.policy import Policy
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ExplanationGeneratorService:
    """
    Generates human-readable explanations for transaction validation decisions
    """
    
    def generate_explanation(
        self,
        validation_result: ValidationResult,
        transaction: Dict[str, Any],
        evaluated_policies: List[Policy]
    ) -> str:
        """
        Generate detailed explanation for validation decision
        
        Args:
            validation_result: The validation result (APPROVED/BLOCKED)
            transaction: Transaction details
            evaluated_policies: List of policies evaluated
            
        Returns:
            Human-readable explanation string
        """
        if validation_result.decision == "approved":
            return self._generate_approved_explanation(
                transaction, evaluated_policies, validation_result
            )
        else:
            return self._generate_blocked_explanation(
                transaction, validation_result, evaluated_policies
            )
    
    def _generate_approved_explanation(
        self,
        transaction: Dict[str, Any],
        policies: List[Policy],
        result: ValidationResult
    ) -> str:
        """Generate explanation for approved transactions"""
        
        amount = transaction.get("amount", 0)
        category = transaction.get("category", "general")
        merchant = transaction.get("merchant", "unknown")
        location = transaction.get("location", "unspecified")
        
        explanation_parts = [
            f"[APPROVED] TRANSACTION APPROVED",
            f"",
            f"Transaction Details:",
            f"  - Amount: INR {amount}",
            f"  - Category: {category.capitalize()}",
            f"  - Merchant: {merchant}",
            f"  - Location: {location}",
            f"",
            f"Validation Summary:",
        ]

        if not policies:
            explanation_parts.append("  - No active policies - transaction allowed by default")
        else:
            explanation_parts.append(f"  - Evaluated {len(policies)} active policy(ies)")
            explanation_parts.append(f"  - All policy checks passed successfully")

            # Add specific policy compliance details
            for policy in policies[:3]:  # Show up to 3 policies
                policy_details = self._describe_policy_compliance(
                    policy, transaction, is_compliant=True
                )
                if policy_details:
                    explanation_parts.append(f"  - {policy_details}")

        explanation_parts.extend([
            f"",
            f"Risk Assessment:",
            f"  - Compliance Status: Compliant",
            f"  - Validation Time: {result.processing_time_ms:.2f}ms",
            f"  - Decision Confidence: High",
            f"",
            f"Recommendation: Proceed with transaction"
        ])
        
        return "\n".join(explanation_parts)
    
    def _generate_blocked_explanation(
        self,
        transaction: Dict[str, Any],
        result: ValidationResult,
        policies: List[Policy]
    ) -> str:
        """Generate explanation for blocked transactions"""
        
        amount = transaction.get("amount", 0)
        category = transaction.get("category", "general")
        merchant = transaction.get("merchant", "unknown")
        location = transaction.get("location", "unspecified")
        
        explanation_parts = [
            f"[BLOCKED] TRANSACTION BLOCKED",
            f"",
            f"Transaction Details:",
            f"  - Amount: INR {amount}",
            f"  - Category: {category.capitalize()}",
            f"  - Merchant: {merchant}",
            f"  - Location: {location}",
            f"",
            f"Violations Detected ({len(result.violations)}):",
        ]
        
        # Detailed violation explanations
        # Note: violations are strings, not objects
        for i, violation in enumerate(result.violations, 1):
            explanation_parts.append(f"")
            explanation_parts.append(f"  {i}. {violation}")
        
        explanation_parts.extend([
            f"",
            f"Policy Analysis:",
            f"  - Total Policies Evaluated: {len(policies)}",
            f"  - Unique Policies Violated: {len(set(result.violations))}",
            f"  - Validation Time: {result.processing_time_ms:.2f}ms",
            f"",
            f"Recommendation: Transaction rejected - address violations to proceed"
        ])
        
        return "\n".join(explanation_parts)
    
    def _describe_policy_compliance(
        self,
        policy: Policy,
        transaction: Dict[str, Any],
        is_compliant: bool
    ) -> str:
        """Describe how transaction complies with policy"""
        
        policy_type = policy.policy_type
        rules = policy.rules
        
        if policy_type == "category_restriction":
            categories = rules.allowed_categories or []
            return f"Category '{transaction.get('category')}' is allowed (permitted: {', '.join(categories)})"
        
        elif policy_type == "spending_limit":
            max_amount = rules.max_amount or 0
            return f"Amount INR {transaction.get('amount')} is within limit (max: INR {max_amount})"
        
        elif policy_type == "geo_restriction":
            allowed_regions = rules.geo_fence or []
            return f"Location {transaction.get('location')} is permitted (allowed: {', '.join(allowed_regions)})"
        
        return f"Policy '{policy.name}' requirements satisfied"
    
    def _get_violation_guidance(self, rule_type: str, transaction: Dict[str, Any]) -> str:
        """Provide specific guidance for violation types"""
        
        guidance_map = {
            "category_restriction": "Try a different spending category that matches your policy",
            "max_amount": "Reduce transaction amount to stay within your spending limit",
            "per_transaction_cap": "Split into smaller transactions or request limit increase",
            "geo_fence": "Transaction location is outside permitted regions",
            "merchant_blacklist": "This merchant is blocked by your policy",
            "merchant_whitelist": "Only approved merchants are allowed",
            "expired_policy": "Policy has expired - renew or remove it"
        }
        
        return guidance_map.get(rule_type, "Review policy settings and transaction details")
    
    def generate_policy_explanation(self, policy: Policy) -> str:
        """Generate explanation for what a policy does"""
        
        explanation_parts = [
            f"Policy: {policy.name}",
            f"Type: {policy.policy_type.replace('_', ' ').title()}",
            f"",
            f"This policy enforces the following rules:",
        ]
        
        rules = policy.rules
        
        if rules.allowed_categories:
            categories = ", ".join(rules.allowed_categories)
            explanation_parts.append(f"  - Only allows spending in: {categories}")

        if rules.max_amount:
            explanation_parts.append(f"  - Maximum total amount: INR {rules.max_amount}")

        if rules.per_transaction_cap:
            explanation_parts.append(f"  - Per-transaction limit: INR {rules.per_transaction_cap}")

        if rules.geo_fence:
            regions = ", ".join(rules.geo_fence)
            explanation_parts.append(f"  - Allowed regions: {regions}")

        if rules.merchant_whitelist:
            merchants = ", ".join(rules.merchant_whitelist)
            explanation_parts.append(f"  - Only approved merchants: {merchants}")

        if rules.merchant_blacklist:
            merchants = ", ".join(rules.merchant_blacklist)
            explanation_parts.append(f"  - Blocked merchants: {merchants}")
        
        if rules.expiry:
            explanation_parts.append(f"  - Expires on: {rules.expiry}")
        
        if policy.description:
            explanation_parts.extend([
                f"",
                f"Description: {policy.description}"
            ])
        
        return "\n".join(explanation_parts)


# Global service instance
explanation_generator = ExplanationGeneratorService()
