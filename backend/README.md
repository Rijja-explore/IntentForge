# IntentForge Backend

## Financial Behaviour & Intent Enforcement Engine

A deterministic AI-augmented financial intent enforcement engine capable of real-time programmable money governance for India's Digital Rupee ecosystem.

---

## 🎯 System Purpose

IntentForge transforms passive digital money into **intent-driven programmable assets** governed by:

- ✅ Intent / Policy Rules
- ✅ Deterministic Enforcement
- ✅ Real-Time Validation
- ✅ Explainable Decisions
- ✅ Behavioural Intelligence
- ✅ Violation Detection
- ✅ Automated Clawbacks
- ✅ Blockchain Audit Hooks

---

## 🏗️ Architecture Overview

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Centralized configuration
│   │
│   ├── models/                 # Pydantic data models
│   │   ├── wallet.py           # Wallet entity & DTOs
│   │   ├── policy.py           # Policy/Intent models
│   │   ├── transaction.py      # Transaction & validation models
│   │   └── response.py         # Standard API responses
│   │
│   ├── routes/                 # API endpoints
│   │   └── health.py           # Health check endpoints
│   │
│   ├── services/               # Business logic layer
│   │   ├── wallet_service.py      # Wallet management
│   │   ├── policy_service.py      # Policy/intent management
│   │   ├── validation_service.py  # Transaction validation
│   │   └── ai_service.py          # AI intent interpretation
│   │
│   └── utils/                  # Utilities
│       ├── logger.py           # Structured logging
│       └── exceptions.py       # Custom exceptions
│
├── requirements.txt            # Python dependencies
├── .env.example               # Environment configuration template
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- pip or poetry

### Installation

1. **Clone the repository** (if not already)

```bash
cd IntentForge/backend
```

2. **Create virtual environment**

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Configure environment**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration (optional for demo)
```

5. **Run the application**

```bash
# Development mode with auto-reload
python app/main.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

6. **Access the API**

- **API Documentation (Swagger)**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 📡 API Endpoints

### Health & Status

- `GET /health` - System health check with component status
- `GET /ready` - Readiness probe
- `GET /live` - Liveness probe
- `GET /version` - API version information

### Coming Soon

- Wallet Management APIs
- Policy/Intent APIs
- Transaction Validation APIs
- AI Intent Parsing APIs
- Clawback APIs
- Analytics & Insights APIs

---

## 🔑 Core Components

### 1. **Wallet Management**
Programmable money containers with governance capabilities.

**Features:**
- Balance management
- Policy attachment
- Compliance scoring
- Lock/unlock mechanisms

### 2. **Policy Engine**
Defines how money behaves through rules and constraints.

**Policy Types:**
- Category Restrictions
- Spending Limits
- Transaction Caps
- Time Restrictions
- Geo Restrictions
- Merchant Allow/Blocklists

### 3. **Validation Engine**
Real-time deterministic transaction validation.

**Capabilities:**
- Sub-100ms validation
- Multi-policy evaluation
- Violation detection
- Explainable decisions

### 4. **AI Service**
Natural language intent parsing and decision reasoning.

**Features:**
- Pattern-based NLP
- Intent extraction
- Decision explanation
- Confidence scoring

---

## 🛠️ Technology Stack

- **Framework**: FastAPI 0.109
- **Language**: Python 3.10+
- **Server**: Uvicorn (ASGI)
- **Validation**: Pydantic v2
- **Documentation**: OpenAPI/Swagger
- **Architecture**: Clean/Modular Service Layer

---

## 🏆 Design Principles

### Deterministic First
All decisions are predictable and reproducible.

### Fintech-Grade Reliability
- Graceful error handling
- Never crashes
- Sub-100ms validation
- Comprehensive logging

### Explainable AI
Every decision includes human-readable reasoning.

### Modular Architecture
Clear separation of concerns for maintainability.

---

## 📊 Performance Targets

- **Transaction Validation**: <100ms
- **Health Check Response**: <10ms
- **AI Intent Parsing**: <50ms
- **API Response Time**: <200ms (p95)

---

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# View coverage report
open htmlcov/index.html
```

---

## 📝 Configuration

All configuration is managed through environment variables. See [.env.example](.env.example) for available options.

### Key Configuration Areas

- **Server Settings**: Host, port, debug mode
- **CORS**: Allowed origins for frontend
- **AI/ML**: Model paths, timeouts, thresholds
- **Validation**: Transaction limits, timeouts
- **Clawback**: Window duration, auto-enable

---

## 🔒 Security Considerations

- Input validation via Pydantic models
- CORS protection
- Request timeout enforcement
- Structured error responses (no stack traces in production)
- Environment-based secrets management

---

## 📦 Deployment

### Production Checklist

- [ ] Set `ENVIRONMENT=production`
- [ ] Set `DEBUG=False`
- [ ] Update `SECRET_KEY`
- [ ] Configure proper CORS origins
- [ ] Set up proper logging infrastructure
- [ ] Enable database persistence (replace mock)
- [ ] Configure monitoring/alerting
- [ ] Set up SSL/TLS
- [ ] Configure rate limiting

### Docker Deployment (Coming Soon)

```dockerfile
# Dockerfile example
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🤝 Development Guidelines

### Code Style

- Follow PEP 8
- Use Black for formatting
- Type hints everywhere
- Comprehensive docstrings

### Commit Messages

- Use conventional commits format
- Be descriptive and specific

### Pull Requests

- Include tests for new features
- Update documentation
- Ensure all tests pass

---

## 📚 Documentation

- **API Docs**: http://localhost:8000/docs (when running)
- **Architecture**: See `/docs` folder (coming soon)
- **Code Comments**: Inline documentation in source files

---

## 🎯 Roadmap

- [x] Core backend skeleton
- [x] Health check endpoint
- [x] Data models (Wallet, Policy, Transaction)
- [x] Service layer architecture
- [x] Basic AI intent parsing
- [ ] Complete wallet management APIs
- [ ] Complete policy management APIs
- [ ] Transaction validation APIs
- [ ] Clawback engine implementation
- [ ] ML behavioral insights
- [ ] Blockchain audit interface
- [ ] Real database integration
- [ ] Comprehensive test suite
- [ ] Production deployment guide

---

## 👥 Team

Built for IntentForge - A fintech hackathon project

---

## 📄 License

[Specify License]

---

## 🆘 Support

For questions or issues:
- Check API documentation at `/docs`
- Review this README
- Check inline code documentation

---

**Built with ❤️ for India's Digital Rupee Revolution**
