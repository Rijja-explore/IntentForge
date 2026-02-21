"""
AI Intent Parser Service
Converts natural language user intents into structured policy JSON
Uses deterministic pattern matching with confidence scoring
"""

from typing import Dict, Any, List, Optional
import re
from datetime import datetime, timedelta
from app.utils.logger import get_logger
from app.utils.exceptions import ValidationException

logger = get_logger(__name__)


class IntentParserService:
    """
    Deterministic intent parser using pattern matching and NLP techniques
    Converts natural language to structured policy JSON
    """
    
    # Category mappings
    CATEGORY_KEYWORDS = {
        "education": ["education", "school", "college", "university", "course", "tuition", "books", "learning", "study"],
        "food": ["food", "restaurant", "meal", "dining", "groceries", "lunch", "dinner", "breakfast"],
        "shopping": ["shopping", "shop", "buy", "purchase", "store", "clothes", "clothing"],
        "entertainment": ["entertainment", "movie", "cinema", "game", "gaming", "concert", "show"],
        "healthcare": ["health", "medical", "doctor", "hospital", "medicine", "pharmacy", "clinic"],
        "transport": ["transport", "taxi", "uber", "ola", "bus", "train", "metro", "travel"],
        "utilities": ["utility", "bill", "electricity", "water", "gas", "internet", "phone"],
        "groceries": ["grocery", "groceries", "supermarket", "vegetables", "fruits"]
    }
    
    # Location mappings (Indian states/cities)
    LOCATION_KEYWORDS = {
        "IN-DL": ["delhi", "new delhi", "ncr"],
        "IN-MH": ["mumbai", "maharashtra", "pune"],
        "IN-KA": ["bangalore", "bengaluru", "karnataka", "mysore"],
        "IN-TN": ["chennai", "tamil nadu", "coimbatore"],
        "IN-WB": ["kolkata", "west bengal"],
        "IN-GJ": ["gujarat", "ahmedabad", "surat"],
        "IN-RJ": ["rajasthan", "jaipur", "udaipur"]
    }
    
    def __init__(self):
        self.confidence_threshold = 0.6
    
    async def parse_intent(self, user_input: str) -> Dict[str, Any]:
        """
        Parse natural language intent into structured policy JSON
        
        Args:
            user_input: Natural language description of policy intent
            
        Returns:
            Structured policy data with confidence score
            
        Raises:
            ValidationException: If intent is too ambiguous
        """
        logger.info(f"Parsing intent: {user_input[:100]}...")
        
        user_input_lower = user_input.lower()
        
        # Extract components
        policy_type = self._extract_policy_type(user_input_lower)
        categories = self._extract_categories(user_input_lower)
        amounts = self._extract_amounts(user_input_lower)
        locations = self._extract_locations(user_input_lower)
        merchants = self._extract_merchants(user_input_lower)
        time_constraints = self._extract_time_constraints(user_input_lower)
        
        # Build rules
        rules = {}
        confidence_scores = []
        
        if categories:
            rules["allowed_categories"] = categories
            confidence_scores.append(0.9)
        
        if amounts:
            if "max_amount" in amounts:
                rules["max_amount"] = amounts["max_amount"]
                confidence_scores.append(0.85)
            if "per_transaction_cap" in amounts:
                rules["per_transaction_cap"] = amounts["per_transaction_cap"]
                confidence_scores.append(0.85)
        
        if locations:
            rules["geo_fence"] = locations
            confidence_scores.append(0.8)
        
        if merchants:
            if merchants["type"] == "whitelist":
                rules["merchant_whitelist"] = merchants["merchants"]
            else:
                rules["merchant_blacklist"] = merchants["merchants"]
            confidence_scores.append(0.75)
        
        if time_constraints:
            rules["expiry"] = time_constraints
            confidence_scores.append(0.7)
        
        # Calculate overall confidence
        overall_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
        
        # Reject if too ambiguous
        if overall_confidence < self.confidence_threshold:
            logger.warning(f"Intent too ambiguous. Confidence: {overall_confidence}")
            raise ValidationException(
                message="Intent is too ambiguous. Please be more specific about categories, amounts, or locations.",
                details={
                    "confidence": overall_confidence,
                    "threshold": self.confidence_threshold,
                    "detected_components": len(confidence_scores)
                }
            )
        
        # Generate policy name from intent
        policy_name = self._generate_policy_name(user_input, categories, amounts, locations)
        
        result = {
            "policy": {
                "name": policy_name,
                "policy_type": policy_type,
                "rules": rules,
                "description": user_input[:200]  # First 200 chars as description
            },
            "confidence": round(overall_confidence, 2),
            "extracted_components": {
                "categories": categories if categories else None,
                "amounts": amounts if amounts else None,
                "locations": locations if locations else None,
                "merchants": merchants if merchants else None,
                "time_constraints": time_constraints if time_constraints else None
            },
            "deterministic": True,
            "requires_review": overall_confidence < 0.8
        }
        
        logger.info(f"Intent parsed successfully. Confidence: {overall_confidence}")
        return result
    
    def _extract_policy_type(self, text: str) -> str:
        """Determine policy type from text"""
        if any(word in text for word in ["only", "restrict", "limit to", "allow only"]):
            return "category_restriction"
        elif any(word in text for word in ["maximum", "max", "limit", "cap", "not more than", "under"]):
            return "spending_limit"
        elif any(word in text for word in ["location", "place", "city", "region", "area"]):
            return "geo_restriction"
        elif any(word in text for word in ["merchant", "store", "vendor", "shop"]):
            return "merchant_restriction"
        else:
            return "category_restriction"  # Default
    
    def _extract_categories(self, text: str) -> Optional[List[str]]:
        """Extract spending categories from text"""
        found_categories = []
        
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            if any(keyword in text for keyword in keywords):
                found_categories.append(category)
        
        return found_categories if found_categories else None
    
    def _extract_amounts(self, text: str) -> Optional[Dict[str, float]]:
        """Extract monetary amounts from text"""
        amounts = {}
        
        # Pattern for amounts: 5000, 5k, 10000, 10k, etc.
        amount_patterns = [
            (r'(\d+)k\b', 1000),  # 5k = 5000
            (r'(\d+)\s*thousand', 1000),
            (r'(\d+)\s*lakh', 100000),
            (r'₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)', 1),  # Regular numbers
            (r'rupees?\s*(\d+)', 1),
            (r'inr\s*(\d+)', 1)
        ]
        
        for pattern, multiplier in amount_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                # Take the first match
                base_amount = float(matches[0].replace(',', ''))
                amount = base_amount * multiplier
                
                # Determine if it's max_amount or per_transaction_cap
                if "per transaction" in text or "each transaction" in text or "every transaction" in text:
                    amounts["per_transaction_cap"] = amount
                else:
                    amounts["max_amount"] = amount
                
                break
        
        return amounts if amounts else None
    
    def _extract_locations(self, text: str) -> Optional[List[str]]:
        """Extract geographic locations from text"""
        found_locations = []
        
        for location_code, keywords in self.LOCATION_KEYWORDS.items():
            if any(keyword in text for keyword in keywords):
                found_locations.append(location_code)
        
        return found_locations if found_locations else None
    
    def _extract_merchants(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract merchant restrictions from text"""
        merchants = []
        merchant_type = "whitelist"
        
        # Check for blacklist indicators
        if any(word in text for word in ["except", "exclude", "not", "block", "ban", "blacklist"]):
            merchant_type = "blacklist"
        
        # Extract merchant names (simplified - could be enhanced with NER)
        # Look for capitalized words that might be merchant names
        words = text.split()
        for i, word in enumerate(words):
            if word[0].isupper() and word not in ["I", "A", "The", "In", "On", "At"]:
                # Check if next word is also capitalized (multi-word merchant)
                if i + 1 < len(words) and words[i + 1][0].isupper():
                    merchants.append(f"{word} {words[i + 1]}")
                elif len(word) > 3:  # Single word merchant
                    merchants.append(word)
        
        if merchants:
            return {
                "type": merchant_type,
                "merchants": list(set(merchants))  # Remove duplicates
            }
        
        return None
    
    def _extract_time_constraints(self, text: str) -> Optional[str]:
        """Extract time constraints and expiry from text"""
        # Look for time-based constraints
        time_keywords = {
            "week": 7,
            "month": 30,
            "year": 365,
            "day": 1
        }
        
        for keyword, days in time_keywords.items():
            pattern = rf'(\d+)\s*{keyword}s?'
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                duration = int(match.group(1))
                expiry_date = datetime.utcnow() + timedelta(days=duration * days)
                return expiry_date.isoformat() + "Z"
        
        return None
    
    def _generate_policy_name(self, text: str, categories: Optional[List[str]], 
                             amounts: Optional[Dict[str, float]], 
                             locations: Optional[List[str]]) -> str:
        """Generate a descriptive policy name"""
        parts = []
        
        if categories:
            parts.append(categories[0].capitalize())
        
        if amounts and "max_amount" in amounts:
            parts.append(f"₹{int(amounts['max_amount'])} Limit")
        
        if locations:
            location_name = locations[0].split('-')[1]  # Get state code
            parts.append(f"in {location_name}")
        
        if not parts:
            # Fallback: use first few words
            words = text.split()[:3]
            parts = [word.capitalize() for word in words]
        
        return " ".join(parts)


# Global service instance
intent_parser_service = IntentParserService()
