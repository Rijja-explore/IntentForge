"""
Stress Test Service
Performance testing and throughput measurement for transaction validation
"""

import asyncio
import time
from typing import Dict, Any, List
from uuid import UUID, uuid4
from datetime import datetime
from statistics import mean, median, stdev

from app.services.validation_service import validation_service
from app.services.policy_service import policy_service
from app.models.transaction import Transaction, TransactionStatus
from app.utils.logger import get_logger

logger = get_logger(__name__)


class StressTestService:
    """
    Service for stress testing transaction validation pipeline
    Simulates high-volume transaction loads and measures performance
    """
    
    def __init__(self):
        self.test_history: List[Dict[str, Any]] = []
    
    async def run_stress_test(
        self,
        wallet_id: UUID,
        num_transactions: int = 100,
        concurrent: bool = False
    ) -> Dict[str, Any]:
        """
        Run stress test with specified number of transactions
        
        Args:
            wallet_id: Wallet to test against
            num_transactions: Number of transactions to simulate
            concurrent: Whether to run tests concurrently
            
        Returns:
            Performance metrics including latency distribution and throughput
        """
        logger.info(f"Starting stress test: {num_transactions} transactions, concurrent={concurrent}")
        
        # Generate test transactions
        test_transactions = self._generate_test_transactions(wallet_id, num_transactions)
        
        # Run tests
        start_time = time.perf_counter()
        
        if concurrent:
            results = await self._run_concurrent_tests(test_transactions)
        else:
            results = await self._run_sequential_tests(test_transactions)
        
        end_time = time.perf_counter()
        total_duration = end_time - start_time
        
        # Calculate metrics
        metrics = self._calculate_metrics(results, total_duration, num_transactions)
        
        # Store in history
        test_record = {
            "test_id": str(uuid4()),
            "wallet_id": str(wallet_id),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "num_transactions": num_transactions,
            "concurrent": concurrent,
            "metrics": metrics
        }
        self.test_history.append(test_record)
        
        logger.info(f"Stress test completed: {metrics['performance_metrics']['throughput_tps']:.2f} TPS")
        
        return metrics
    
    def _generate_test_transactions(self, wallet_id: UUID, count: int) -> List[Dict[str, Any]]:
        """Generate synthetic transactions for testing"""
        transactions = []
        categories = ["food", "shopping", "education", "transport", "entertainment"]
        merchants = ["Merchant_A", "Merchant_B", "Merchant_C", "Merchant_D", "Merchant_E"]
        locations = ["IN-DL", "IN-MH", "IN-KA", "IN-TN"]
        
        for i in range(count):
            tx = {
                "transaction_id": str(uuid4()),
                "wallet_id": wallet_id,
                "amount": float(500 + (i % 50) * 100),  # Varies between 500-5000
                "merchant": merchants[i % len(merchants)],
                "category": categories[i % len(categories)],
                "location": locations[i % len(locations)],
                "timestamp": datetime.utcnow().isoformat()
            }
            transactions.append(tx)
        
        return transactions
    
    async def _run_sequential_tests(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Run tests sequentially"""
        results = []

        for tx in transactions:
            start = time.perf_counter()
            try:
                wallet_id = tx["wallet_id"]
                active_policies = await policy_service.get_wallet_policies(wallet_id)
                transaction = Transaction(
                    wallet_id=wallet_id,
                    amount=tx["amount"],
                    category=tx["category"],
                    merchant=tx["merchant"],
                    location=tx["location"],
                    status=TransactionStatus.PENDING
                )
                validation_result = await validation_service.validate_transaction(
                    transaction=transaction,
                    policies=active_policies
                )
                
                end = time.perf_counter()
                latency_ms = (end - start) * 1000
                
                results.append({
                    "transaction_id": tx["transaction_id"],
                    "status": "success",
                    "result": validation_result.decision,
                    "latency_ms": latency_ms
                })

            except Exception as e:
                end = time.perf_counter()
                latency_ms = (end - start) * 1000

                results.append({
                    "transaction_id": tx["transaction_id"],
                    "status": "error",
                    "error": str(e),
                    "latency_ms": latency_ms
                })

        return results

    async def _run_concurrent_tests(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Run tests concurrently"""
        tasks = []
        
        for tx in transactions:
            task = self._validate_single_transaction(tx)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    "transaction_id": transactions[i]["transaction_id"],
                    "status": "error",
                    "error": str(result),
                    "latency_ms": 0
                })
            else:
                processed_results.append(result)
        
        return processed_results
    
    async def _validate_single_transaction(self, tx: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a single transaction with timing"""
        start = time.perf_counter()

        try:
            wallet_id = tx["wallet_id"]
            active_policies = await policy_service.get_wallet_policies(wallet_id)
            transaction = Transaction(
                wallet_id=wallet_id,
                amount=tx["amount"],
                category=tx["category"],
                merchant=tx["merchant"],
                location=tx["location"],
                status=TransactionStatus.PENDING
            )
            validation_result = await validation_service.validate_transaction(
                transaction=transaction,
                policies=active_policies
            )
            
            end = time.perf_counter()
            latency_ms = (end - start) * 1000
            
            return {
                "transaction_id": tx["transaction_id"],
                "status": "success",
                "result": validation_result.decision,
                "latency_ms": latency_ms
            }

        except Exception as e:
            end = time.perf_counter()
            latency_ms = (end - start) * 1000
            
            return {
                "transaction_id": tx["transaction_id"],
                "status": "error",
                "error": str(e),
                "latency_ms": latency_ms
            }
    
    def _calculate_metrics(
        self,
        results: List[Dict[str, Any]],
        total_duration: float,
        num_transactions: int
    ) -> Dict[str, Any]:
        """Calculate performance metrics from test results"""
        
        # Extract latencies
        latencies = [r["latency_ms"] for r in results if r["status"] == "success"]
        
        # Count statuses
        success_count = sum(1 for r in results if r["status"] == "success")
        error_count = sum(1 for r in results if r["status"] == "error")
        
        # Count validation results
        approved_count = sum(1 for r in results 
                            if r["status"] == "success" and r.get("result") == "APPROVED")
        blocked_count = sum(1 for r in results 
                           if r["status"] == "success" and r.get("result") == "BLOCKED")
        
        # Calculate statistics
        if latencies:
            avg_latency = mean(latencies)
            median_latency = median(latencies)
            min_latency = min(latencies)
            max_latency = max(latencies)
            std_latency = stdev(latencies) if len(latencies) > 1 else 0
            
            # Percentiles
            sorted_latencies = sorted(latencies)
            p50 = sorted_latencies[len(sorted_latencies) // 2]
            p95 = sorted_latencies[int(len(sorted_latencies) * 0.95)]
            p99 = sorted_latencies[int(len(sorted_latencies) * 0.99)]
        else:
            avg_latency = median_latency = min_latency = max_latency = std_latency = 0
            p50 = p95 = p99 = 0
        
        # Throughput
        throughput_tps = num_transactions / total_duration if total_duration > 0 else 0
        
        # Determine if sub-100ms target is met
        meets_target = avg_latency < 100 and p95 < 100
        
        metrics = {
            "test_summary": {
                "total_transactions": num_transactions,
                "successful_transactions": success_count,
                "failed_transactions": error_count,
                "success_rate": (success_count / num_transactions * 100) if num_transactions > 0 else 0
            },
            "validation_results": {
                "approved": approved_count,
                "blocked": blocked_count,
                "approval_rate": (approved_count / success_count * 100) if success_count > 0 else 0
            },
            "performance_metrics": {
                "total_duration_seconds": round(total_duration, 3),
                "throughput_tps": round(throughput_tps, 2),
                "average_latency_ms": round(avg_latency, 3),
                "median_latency_ms": round(median_latency, 3),
                "min_latency_ms": round(min_latency, 3),
                "max_latency_ms": round(max_latency, 3),
                "std_dev_latency_ms": round(std_latency, 3)
            },
            "latency_percentiles": {
                "p50_ms": round(p50, 3),
                "p95_ms": round(p95, 3),
                "p99_ms": round(p99, 3)
            },
            "target_compliance": {
                "sub_100ms_target": meets_target,
                "target_threshold_ms": 100,
                "meets_average": avg_latency < 100,
                "meets_p95": p95 < 100
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        return metrics
    
    def get_test_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent stress test history"""
        return self.test_history[-limit:]


# Singleton instance
stress_test_service = StressTestService()
