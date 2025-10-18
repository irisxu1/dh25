#!/bin/bash

echo "🚀 Starting DubHacks 2025 InterviewPrep AI Development Environment"
echo "============================================================"

# Navigate to project directory
cd "$(dirname "$0")/dubhacksmain"

echo "📁 Current directory: $(pwd)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🎯 Starting development server..."
echo "🌐 App will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm start
