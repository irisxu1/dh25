# Rehearsal Room - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- API keys for Gemini, ElevenLabs, and optionally OpenAI

### 1. Environment Setup

1. **Copy the environment template:**
   ```bash
   cp env.template .env
   ```

2. **Fill in your API keys in `.env`:**
   ```bash
   # Required API Keys
   GEMINI_API_KEY=your_actual_gemini_api_key
   ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key
   
   # Optional (for fallback analysis)
   OPENAI_API_KEY=your_actual_openai_api_key
   
   # Server Configuration
   PORT=3001
   NODE_ENV=production
   ```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Application
```bash
npm run build
```

### 4. Start the Server
```bash
npm run server
```

The application will be available at `http://localhost:3001`

## 🔑 API Keys Setup

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

### ElevenLabs API Key
1. Go to [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys)
2. Create a new API key
3. Add it to your `.env` file as `ELEVENLABS_API_KEY`

### OpenAI API Key (Optional)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file as `OPENAI_API_KEY`

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add all the environment variables from your `.env` file

### Option 2: Netlify

1. **Build command:** `npm run build`
2. **Publish directory:** `build`
3. **Add environment variables in Netlify dashboard**

### Option 3: Traditional Hosting

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Upload the `build` folder to your web server**

3. **Set up a Node.js server for the backend:**
   ```bash
   npm run server
   ```

4. **Configure your web server to proxy API requests to the backend**

## 🔒 Security Checklist

- ✅ API keys are stored in environment variables
- ✅ `.env` files are in `.gitignore`
- ✅ No hardcoded API keys in source code
- ✅ Server validates API keys on startup
- ✅ CORS is properly configured

## 🐛 Troubleshooting

### Server won't start
- Check that all required environment variables are set
- Verify API keys are valid
- Check that port 3001 is available

### API calls failing
- Verify API keys are correct
- Check network connectivity
- Review server logs for error messages

### Build fails
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors
- Verify Node.js version is 16+

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for interview analysis |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs API key for speech services |
| `OPENAI_API_KEY` | No | OpenAI API key for fallback analysis |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment (development/production) |

## 🎯 Features

- **AI-Powered Analysis**: Gemini AI provides comprehensive interview feedback
- **Speech Services**: ElevenLabs handles text-to-speech and speech-to-text
- **Video Recording**: Practice with camera feedback
- **STAR Method Analysis**: Detailed breakdown of interview responses
- **Company-Specific Questions**: Tailored for major tech companies
- **Real-time Feedback**: Instant analysis and improvement suggestions

## 📞 Support

For issues or questions, please check the troubleshooting section above or review the server logs for detailed error messages.
