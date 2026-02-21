# IntentForge Backend - Project Structure

## Complete Directory Tree

```
backend/
│
├── app/                                # Main application package
│   ├── __init__.py                    # Package initialization
│   ├── main.py                        # FastAPI application entry point
│   ├── config.py                      # Centralized configuration management
│   │
│   ├── models/                        # Data models (Pydantic)
│   │   ├── __init__.py               # Models package exports
│   │   ├── wallet.py                 # Wallet entity & DTOs
│   │   ├── policy.py                 # Policy/Intent models
│   │   ├── transaction.py            # Transaction & validation models
│   │   └── response.py               # Standard API response models
│   │
│   ├── routes/                        # API endpoint definitions
│   │   ├── __init__.py               # Routes package
│   │   └── health.py                 # Health check endpoints
│   │
│   ├── services/                      # Business logic layer
│   │   ├── __init__.py               # Services package
│   │   ├── wallet_service.py         # Wallet management service
│   │   ├── policy_service.py         # Policy/intent management service
│   │   ├── validation_service.py     # Transaction validation service
│   │   └── ai_service.py             # AI intent interpretation service
│   │
│   └── utils/                         # Utility modules
│       ├── __init__.py               # Utils package exports
│       ├── logger.py                 # Structured logging utilities
│       └── exceptions.py             # Custom exception classes
│
├── tests/                             # Test suite
│   ├── __init__.py                   # Tests package
│   ├── conftest.py                   # Pytest configuration & fixtures
│   └── test_health.py                # Health endpoint tests
│
├── requirements.txt                   # Python dependencies
├── .env.example                       # Environment configuration template
├── .gitignore                        # Git ignore rules
├── README.md                         # Main documentation
├── STRUCTURE.md                      # This file
├── start.ps1                         # Windows start script
└── start.sh                          # Linux/Mac start script
```

## Module Descriptions

### Core Application (`app/`)

#### `main.py`
- FastAPI application initialization
- CORS middleware configuration
- Global exception handlers
- Request timing middleware
- Startup/shutdown event handlers
- Router registration

#### `config.py`
- Environment variable management
- Application settings
- Configuration validation via Pydantic
- Centralized constants

### Data Models (`app/models/`)

#### `wallet.py`
- `Wallet` - Core wallet entity
- `WalletCreate` - Wallet creation DTO
- `WalletResponse` - Wallet operation response

#### `policy.py`
- `Policy` - Policy/Intent entity
- `PolicyCreate` - Policy creation DTO
- `PolicyType` - Enum of policy types
- `PolicyResponse` - Policy operation response

#### `transaction.py`
- `Transaction` - Transaction entity
- `TransactionCreate` - Transaction validation request
- `TransactionStatus` - Transaction outcome enum
- `ValidationResult` - Detailed validation response

#### `response.py`
- `HealthResponse` - Health check response
- `BaseResponse` - Standard API response
- `ErrorResponse` - Error response format
- `DecisionResponse` - AI decision response

### API Routes (`app/routes/`)

#### `health.py`
- `GET /health` - System health check
- `GET /ready` - Readiness probe
- `GET /live` - Liveness probe

### Business Services (`app/services/`)

#### `wallet_service.py`
- Wallet creation and management
- Balance operations
- Policy attachment
- In-memory storage (mock)

#### `policy_service.py`
- Policy creation and management
- Policy retrieval and listing
- Conflict detection (placeholder)

#### `validation_service.py`
- Real-time transaction validation
- Multi-policy evaluation
- Violation detection
- Decision reasoning generation

#### `ai_service.py`
- Natural language intent parsing
- Pattern-based NLP
- Decision explanation
- Confidence scoring

### Utilities (`app/utils/`)

#### `logger.py`
- Structured logging setup
- Performance tracking decorator
- Execution time monitoring

#### `exceptions.py`
- Custom exception classes
- Domain-specific errors
- Consistent error responses

### Tests (`tests/`)

#### `test_health.py`
- Health endpoint tests
- Response validation
- Performance checks

#### `conftest.py`
- Test fixtures
- Sample data generators
- Test client configuration

## Configuration Files

### `requirements.txt`
Python package dependencies:
- FastAPI - Web framework
- Uvicorn - ASGI server
- Pydantic - Data validation
- Pytest - Testing framework

### `.env.example`
Environment variable template:
- Server configuration
- API settings
- Feature flags
- Service timeouts

### `.gitignore`
Git ignore patterns:
- Python cache files
- Virtual environments
- Environment files
- Logs and temporary files

## Start Scripts

### `start.ps1` (Windows)
PowerShell script that:
- Creates virtual environment
- Installs dependencies
- Creates .env file
- Starts the server

### `start.sh` (Linux/Mac)
Bash script that:
- Creates virtual environment
- Installs dependencies
- Creates .env file
- Starts the server

## Architecture Highlights

### Clean Architecture
- Clear separation of concerns
- Models → Services → Routes
- Independent business logic

### Modular Design
- Each module has single responsibility
- Easy to extend and maintain
- Testable components

### Production-Ready
- Error handling
- Logging
- Configuration management
- Health checks
- Performance monitoring

### Fintech-Grade
- Deterministic behavior
- Explainable decisions
- Sub-100ms targets
- Graceful error handling

## Next Steps

1. **Wallet Management APIs** - Complete CRUD operations
2. **Policy Management APIs** - Full policy lifecycle
3. **Transaction Validation APIs** - Real-time validation
4. **Clawback Engine** - Violation recovery
5. **ML Insights** - Behavioral analysis
6. **Blockchain Interface** - Audit trail integration
7. **Database Integration** - Replace mock storage
8. **Authentication** - JWT-based auth
9. **Rate Limiting** - API protection
10. **Comprehensive Tests** - Full test coverage

## Running the Application

### Quick Start (Windows)
```powershell
.\start.ps1
```

### Quick Start (Linux/Mac)
```bash
chmod +x start.sh
./start.sh
```

### Manual Start
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python app/main.py
```

### Access Points
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health: http://localhost:8000/health

## Development Workflow

1. Activate virtual environment
2. Make code changes
3. Run tests: `pytest`
4. Check with type checker: `mypy app/`
5. Format code: `black app/`
6. Commit changes

---

**Note**: This is a hackathon-optimized structure focusing on clarity, reliability, and demo readiness.
