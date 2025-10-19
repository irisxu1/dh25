# Rehearsal Room - Local Development Setup

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/irisxu1/dh25.git
   cd dh25/dubhacksmain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env
   ```
   
   Then edit `.env` and add your API keys:
   ```bash
   # Required for full functionality
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Optional (for OpenAI features)
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```
   
   This will start:
   - React app on http://localhost:3000
   - Backend server on http://localhost:3001

## API Keys Setup

### ElevenLabs API Key
1. Go to [ElevenLabs](https://elevenlabs.io/app/settings/api-keys)
2. Create an account and get your API key
3. Add it to your `.env` file as `ELEVENLABS_API_KEY`

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

### OpenAI API Key (Optional)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Add it to your `.env` file as `OPENAI_API_KEY`

## Development Without API Keys

The app will still run without API keys, but with limited functionality:
- ✅ React app will load
- ✅ Basic UI will work
- ❌ Text-to-speech will show error messages
- ❌ Speech-to-text will show error messages
- ❌ AI analysis will show error messages

## Troubleshooting

### Server won't start
- Make sure port 3001 is not in use
- Check that all dependencies are installed: `npm install`

### API calls failing
- Verify your API keys are set in `.env`
- Check the browser console for error messages
- Check the server console for error messages

### Build errors
- Make sure you're using Node.js 18 or higher
- Try deleting `node_modules` and running `npm install` again

## Available Scripts

- `npm start` - Start React app only
- `npm run server` - Start backend server only
- `npm run dev` - Start both React app and backend server
- `npm run build` - Build for production
- `npm test` - Run tests

## Project Structure

```
dubhacksmain/
├── src/                    # React app source code
├── server/                 # Backend Express server
├── api/                    # Vercel serverless functions
├── public/                 # Static assets
├── .env                    # Environment variables (create from env.template)
└── package.json           # Dependencies and scripts
```

## Need Help?

1. Check the console for error messages
2. Verify your API keys are correct
3. Make sure all dependencies are installed
4. Try restarting the development servers
