# IntentForge Backend - Quick Start Script
# Run this script to start the backend server

Write-Host "Starting IntentForge Backend..." -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-Not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv venv
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Virtual environment created successfully" -ForegroundColor Green
    } else {
        Write-Host "Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& "venv\Scripts\Activate.ps1"

# Check if dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Cyan
$fastapi_installed = pip show fastapi 2>$null
if (-Not $fastapi_installed) {
    Write-Host "Dependencies not installed. Installing..." -ForegroundColor Yellow
    pip install -r requirements.txt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Dependencies already installed" -ForegroundColor Green
}

# Create .env if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host ".env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ".env file created. Edit it to customize configuration." -ForegroundColor Green
}

Write-Host ""
Write-Host ("=" * 78) -ForegroundColor Cyan
Write-Host "IntentForge Backend - Financial Intent Enforcement Engine" -ForegroundColor Green
Write-Host ("=" * 78) -ForegroundColor Cyan
Write-Host ""
Write-Host "Server will start on: http://localhost:8000" -ForegroundColor White
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor White
Write-Host "ReDoc: http://localhost:8000/redoc" -ForegroundColor White
Write-Host "Health Check: http://localhost:8000/health" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host ("=" * 78) -ForegroundColor Cyan
Write-Host ""

# Start the server
python -m uvicorn app.main:app --reload
