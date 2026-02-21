#!/bin/bash
# IntentForge Backend - Quick Start Script (Linux/Mac)
# Run this script to start the backend server

echo "🚀 Starting IntentForge Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found. Creating one..."
    python3 -m venv venv
    
    if [ $? -eq 0 ]; then
        echo "✅ Virtual environment created successfully"
    else
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
echo "🔍 Checking dependencies..."
if ! pip show fastapi > /dev/null 2>&1; then
    echo "⚠️  Dependencies not installed. Installing..."
    pip install -r requirements.txt
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ .env file created. Edit it to customize configuration."
fi

echo ""
echo "================================================================================"
echo "🎯 IntentForge Backend - Financial Intent Enforcement Engine"
echo "================================================================================"
echo ""
echo "📡 Server will start on: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "🔍 ReDoc: http://localhost:8000/redoc"
echo "❤️  Health Check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "================================================================================"
echo ""

# Start the server
python app/main.py
