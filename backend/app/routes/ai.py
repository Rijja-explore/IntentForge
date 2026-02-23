"""
AI Service API Routes
Endpoints for AI-powered intent parsing and natural language processing
"""

from fastapi import APIRouter, HTTPException, status, Path
from pydantic import BaseModel, Field
from typing import Dict, Any, List
from uuid import UUID

from app.services.intent_parser_service import intent_parser_service
from app.models.response import APIResponse
from app.utils.logger import get_logger
from app.utils.exceptions import ValidationException

logger = get_logger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Services"])


class IntentParseRequest(BaseModel):
    """Request model for intent parsing"""
    user_input: str = Field(
        ...,
        description="Natural language description of spending policy",
        min_length=3,
        max_length=1000,
        example="I want to spend only on education and books, maximum 10000 rupees per month in Delhi"
    )
    wallet_id: str = Field(
        None,
        description="Optional wallet ID to attach policy to",
        example="123e4567-e89b-12d3-a456-426614174000"
    )


@router.post(
    "/parse-intent",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Parse Natural Language Intent",
    description="""
    **AI-Powered Intent Parser**
    
    Converts natural language user intents into structured policy JSON using
    deterministic pattern matching and NLP techniques.
    
    ### Features:
    - **Deterministic Output** - Same input produces same structured policy
    - **Confidence Scoring** - Returns confidence level (0.0 - 1.0)
    - **Ambiguity Rejection** - Rejects inputs with confidence < 0.6
    - **Component Extraction** - Identifies categories, amounts, locations, merchants
    
    ### Supported Intent Types:
    
    1. **Category Restrictions**
       - "Only allow education spending"
       - "Restrict to food and groceries"
    
    2. **Spending Limits**
       - "Maximum 5000 rupees per month"
       - "Limit spending to 10k"
    
    3. **Geographic Restrictions**
       - "Only in Delhi and Mumbai"
       - "Restrict to Bangalore area"
    
    4. **Merchant Controls**
       - "Allow only BookStore and Library"
       - "Block Casino and Tobacco merchants"
    
    5. **Time Constraints**
       - "Valid for 3 months"
       - "Expires in 1 year"
    
    ### Example Inputs:
    ```
    "I want to spend only on education, max 10000 rupees in Delhi"
    "Limit shopping to 5k per transaction in Mumbai and Pune"
    "Allow only food and groceries, maximum 3000 rupees per month"
    "Block all entertainment spending except movies"
    ```
    
    ### Response Structure:
    - `policy` - Structured policy JSON ready for creation
    - `confidence` - Confidence score (0.6 - 1.0)
    - `extracted_components` - Detected categories, amounts, locations
    - `requires_review` - True if confidence < 0.8
    
    ### Error Handling:
    - 422: Intent too ambiguous (confidence < 0.6)
    - 400: Invalid input format
    """
)
async def parse_intent(request: IntentParseRequest) -> APIResponse[dict]:
    """
    Parse natural language intent into structured policy JSON
    
    Args:
        request: Intent parse request with user input
        
    Returns:
        APIResponse with structured policy and confidence score
        
    Raises:
        HTTPException: If intent is too ambiguous or invalid
    """
    try:
        logger.info(f"Parsing intent: '{request.user_input[:50]}...'")
        
        # Parse intent using AI service
        result = await intent_parser_service.parse_intent(request.user_input)
        
        # Add wallet_id if provided
        if request.wallet_id:
            result["policy"]["wallet_id"] = request.wallet_id
        
        # Determine message based on confidence
        if result["confidence"] >= 0.8:
            message = "Intent parsed successfully with high confidence"
        else:
            message = "Intent parsed - manual review recommended due to lower confidence"
        
        logger.info(f"Intent parsed. Confidence: {result['confidence']}")
        
        return APIResponse(
            success=True,
            message=message,
            data=result
        )
        
    except ValidationException as e:
        logger.warning(f"Intent parsing validation failed: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "AMBIGUOUS_INTENT",
                "message": e.message,
                "details": e.details
            }
        )
    except Exception as e:
        logger.error(f"Intent parsing failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Intent parsing failed: {str(e)}"
        )


@router.get(
    "/supported-categories",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Get Supported Categories",
    description="Returns list of spending categories recognized by the AI parser"
)
async def get_supported_categories() -> APIResponse[dict]:
    """
    Get list of supported spending categories
    
    Returns:
        APIResponse with category mappings
    """
    categories = {
        "categories": list(intent_parser_service.CATEGORY_KEYWORDS.keys()),
        "locations": list(intent_parser_service.LOCATION_KEYWORDS.keys()),
        "total_categories": len(intent_parser_service.CATEGORY_KEYWORDS),
        "total_locations": len(intent_parser_service.LOCATION_KEYWORDS)
    }
    
    return APIResponse(
        success=True,
        message="Supported categories retrieved",
        data=categories
    )


@router.get(
    "/health",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="AI Service Health Check"
)
async def ai_health_check() -> APIResponse[dict]:
    """
    Check AI service health and readiness
    
    Returns:
        APIResponse with service status
    """
    status_data = {
        "service": "ai_intent_parser",
        "status": "operational",
        "model_type": "deterministic_pattern_matching",
        "confidence_threshold": intent_parser_service.confidence_threshold,
        "supported_languages": ["en"],
        "features": [
            "intent_parsing",
            "category_extraction",
            "amount_extraction",
            "location_extraction",
            "merchant_extraction",
            "time_constraint_extraction"
        ]
    }
    
    return APIResponse(
        success=True,
        message="AI service is operational",
        data=status_data
    )


@router.get(
    "/suggestions/{wallet_id}",
    response_model=APIResponse[List[dict]],
    status_code=status.HTTP_200_OK,
    summary="Get AI Policy Suggestions for Wallet",
)
async def get_ai_suggestions(
    wallet_id: UUID = Path(..., description="Wallet identifier")
) -> APIResponse[List[dict]]:
    """
    Return AI-generated policy suggestions based on common spending patterns.
    These are template intents the user can review and deploy as policies.
    """
    suggestions = [
        {
            "id": "s1",
            "title": "Block gambling",
            "intent": "Block all gambling and betting transactions",
            "confidence": 0.95,
            "category": "restriction",
        },
        {
            "id": "s2",
            "title": "Limit food spending",
            "intent": "Limit food and dining spending to 3000 rupees per month",
            "confidence": 0.90,
            "category": "limit",
        },
        {
            "id": "s3",
            "title": "Education budget",
            "intent": "Allow only education and books, maximum 10000 rupees",
            "confidence": 0.88,
            "category": "allowlist",
        },
        {
            "id": "s4",
            "title": "Night-time lock",
            "intent": "Block all transactions after 11 PM",
            "confidence": 0.85,
            "category": "time",
        },
    ]
    return APIResponse(
        success=True,
        message=f"{len(suggestions)} AI suggestions ready",
        data=suggestions,
    )
