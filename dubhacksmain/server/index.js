require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { router: elevenlabsRoutes } = require('./routes/elevenlabs');
const { router: openaiRoutes } = require('./routes/openai');
const { router: geminiRoutes } = require('./routes/gemini');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads (used by ElevenLabs speech-to-text)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB limit (tripled from 10MB)
  },
});

// Routes
app.use('/api/elevenlabs', upload.single('audio'), elevenlabsRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/gemini', geminiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
