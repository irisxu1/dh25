#!/bin/bash

# Rehearsal Room - Environment Setup Script
echo "🎭 Rehearsal Room - Environment Setup"
echo "====================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp env.template .env
fi

echo ""
echo "⚠️  IMPORTANT: You need to update your .env file with actual API keys!"
echo ""
echo "Please edit the .env file and replace the placeholder values:"
echo ""
echo "1. ELEVENLABS_API_KEY=your_elevenlabs_api_key_here"
echo "   → Replace with your actual ElevenLabs API key"
echo ""
echo "2. GEMINI_API_KEY=your_gemini_api_key_here"  
echo "   → Replace with your actual Gemini API key"
echo ""
echo "3. OPENAI_API_KEY=your_openai_api_key_here"
echo "   → Replace with your actual OpenAI API key (optional)"
echo ""
echo "After updating the .env file, restart the server with:"
echo "  npm run server"
echo ""
echo "To test if everything works:"
echo "  npm run dev"
echo ""
