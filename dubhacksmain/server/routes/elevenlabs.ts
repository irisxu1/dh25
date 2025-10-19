import express from 'express';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_80e980bf40026ecd7d283ab8683c973a52751516e9d0578f';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Text-to-Speech endpoint
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voiceId = 'pNInz6obpgDQGcFmaJgB' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert audio buffer to base64
    const audioBuffer = Buffer.from(response.data);
    const base64Audio = audioBuffer.toString('base64');

    res.json({
      audio: base64Audio,
      format: 'audio/mpeg'
    });
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Speech-to-Text endpoint
router.post('/speech-to-text', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const formData = new FormData();
    formData.append('audio', req.file.buffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    formData.append('model_id', 'whisper-1');

    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/speech-to-text`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'xi-api-key': ELEVENLABS_API_KEY
        }
      }
    );

    res.json({
      transcriptionId: response.data.transcription_id,
      text: response.data.text || ''
    });
  } catch (error) {
    console.error('ElevenLabs STT error:', error);
    res.status(500).json({ 
      error: 'Failed to transcribe speech',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get transcript details endpoint
router.get('/transcript/:transcriptionId', async (req, res) => {
  try {
    const { transcriptionId } = req.params;

    const response = await axios.get(
      `${ELEVENLABS_BASE_URL}/speech-to-text/transcripts/${transcriptionId}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('ElevenLabs transcript error:', error);
    res.status(500).json({ 
      error: 'Failed to get transcript',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get available voices
router.get('/voices', async (req, res) => {
  try {
    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('ElevenLabs voices error:', error);
    res.status(500).json({ 
      error: 'Failed to get voices',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as elevenlabsRoutes };