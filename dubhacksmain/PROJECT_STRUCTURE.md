# Project Structure

This project follows a full-stack architecture with a React frontend and Express backend.

```
your-project/
├─ .env.local                 # Environment variables (create this file)
├─ package.json              # Dependencies and scripts
├─ tsconfig.json             # TypeScript configuration
├─ server/                   # Backend Express server
│  ├─ index.ts              # Express app entry point
│  └─ routes/
│     ├─ elevenlabs.ts      # ElevenLabs API routes
│     └─ gemini.ts          # Gemini AI analysis routes
└─ src/                     # React frontend
   ├─ App.tsx               # Main app component
   ├─ components/           # React components
   │  ├─ InterviewRecorder.tsx
   │  └─ FeedbackDashboard.tsx
   ├─ services/             # API service functions
   │  ├─ elevenLabsService.ts
   │  └─ voiceAnalysisService.ts
   └─ ... (other React files)
```

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
# ElevenLabs API Key
ELEVENLABS_API_KEY=sk_80e980bf40026ecd7d283ab8683c973a52751516e9d0578f

# Server Configuration
PORT=3001
NODE_ENV=development

# Add other API keys as needed
# GEMINI_API_KEY=your_gemini_api_key_here
# STATSIG_API_KEY=your_statsig_api_key_here
```

## Available Scripts

- `npm start` - Start React development server (port 3000)
- `npm run server` - Start Express backend server (port 3001)
- `npm run dev` - Start both frontend and backend concurrently
- `npm run build` - Build React app for production
- `npm run build:server` - Build TypeScript server
- `npm run start:prod` - Start production server

## API Endpoints

The backend provides these ElevenLabs API endpoints:

- `POST /api/elevenlabs/text-to-speech` - Convert text to speech
- `POST /api/elevenlabs/speech-to-text` - Convert speech to text
- `GET /api/elevenlabs/transcript/:id` - Get detailed transcript
- `GET /api/elevenlabs/voices` - Get available voices
- `POST /api/gemini/analyze` - Analyze interview transcript with AI
- `GET /health` - Health check

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file with your API keys

3. Start development servers:
   ```bash
   npm run dev
   ```

This will start:
- React app on http://localhost:3000
- Express server on http://localhost:3001

## Adding New API Routes

To add new backend routes:

1. Create a new route file in `server/routes/`
2. Import and use it in `server/index.ts`
3. Update the frontend services to call the new endpoints

Example:
```typescript
// server/routes/gemini.ts
import express from 'express';
const router = express.Router();

router.post('/analyze', async (req, res) => {
  // Your Gemini API logic here
});

export { router as geminiRoutes };
```

Then in `server/index.ts`:
```typescript
import { geminiRoutes } from './routes/gemini';
app.use('/api/gemini', geminiRoutes);
```
