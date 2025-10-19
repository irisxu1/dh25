# Vercel Deployment Guide for Rehearsal Room

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **API Keys**: You'll need the following API keys:
   - ElevenLabs API Key
   - Gemini API Key
   - Supabase URL and Anon Key

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a React app

### 2. Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

### 3. Build Settings

Vercel should automatically detect:
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 4. Deploy

1. Click **Deploy**
2. Wait for the build to complete
3. Your app will be available at `https://your-project-name.vercel.app`

## Project Structure for Vercel

```
your-project/
├── api/                    # Serverless functions
│   ├── elevenlabs/
│   │   ├── text-to-speech.js
│   │   ├── speech-to-text.js
│   │   └── voices.js
│   ├── gemini/
│   │   └── analyze-interview.js
│   └── health.js
├── public/                 # Static assets
├── src/                    # React app source
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies and scripts
└── .vercelignore          # Files to ignore during deployment
```

## API Endpoints

After deployment, your API endpoints will be available at:

- `https://your-project.vercel.app/api/health`
- `https://your-project.vercel.app/api/elevenlabs/text-to-speech`
- `https://your-project.vercel.app/api/elevenlabs/speech-to-text`
- `https://your-project.vercel.app/api/elevenlabs/voices`
- `https://your-project.vercel.app/api/gemini/analyze-interview`

## Troubleshooting

### Common Issues

1. **404 Error**: Make sure your `vercel.json` is properly configured
2. **API Key Errors**: Verify all environment variables are set correctly
3. **Build Failures**: Check that all dependencies are in `package.json`
4. **CORS Issues**: The API functions include CORS headers

### Environment Variables

Make sure to set these in Vercel:
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `GEMINI_API_KEY`: Your Google Gemini API key
- `NODE_ENV`: Set to `production`

### File Size Limits

- Vercel has a 50MB limit for serverless functions
- Audio files are limited to 30MB (configured in the API)
- If you need larger files, consider using Vercel's Pro plan

## Local Development

To test locally with the same setup:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start just the React app
npm start
```

## Production vs Development

The app automatically detects the environment:
- **Development**: Uses `http://localhost:3001` for API calls
- **Production**: Uses relative paths `/api/...` for API calls

This is handled in the service files (`elevenLabsService.ts`, `geminiService.ts`).
