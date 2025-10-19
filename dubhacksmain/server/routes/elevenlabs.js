const express = require('express');
const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

const router = express.Router();

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.error('ELEVENLABS_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY
});

// Text-to-Speech endpoint
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voiceId = 'pNInz6obpgDQGcFmaJgB' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      modelId: "eleven_turbo_v2_5",
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.5,
        style: 0.0,
        useSpeakerBoost: true
      }
    });

    // Convert audio stream to base64
    const chunks = [];
    const reader = audio.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const audioBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }
    
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

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

    console.log('Received audio file:', {
      size: req.file.buffer.length,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname
    });

    // Create a Blob from the uploaded file buffer
    const audioBlob = new Blob([req.file.buffer], { type: 'audio/webm' });

    console.log('Created audio blob:', {
      size: audioBlob.size,
      type: audioBlob.type
    });

    const transcription = await elevenlabs.speechToText.convert({
      file: audioBlob,
      modelId: "scribe_v1", // Model to use, for now only "scribe_v1" is supported
      tagAudioEvents: true, // Tag audio events like laughter, applause, etc
      languageCode: "eng", // Language of the audio file
      diarize: true // Whether to annotate who is speaking
    });

    console.log('ElevenLabs transcription result:', transcription);

    // Handle the response structure properly
    let text = '';
    let transcriptionId = '';
    
    if (typeof transcription === 'string') {
      text = transcription;
    } else if (transcription && typeof transcription === 'object') {
      // Type assertion to handle the response structure
      text = transcription.text || transcription.transcript || '';
      transcriptionId = transcription.transcriptionId || transcription.id || '';
    }

    console.log('Processed transcription:', { text, transcriptionId });

    res.json({
      transcriptionId: transcriptionId,
      text: text
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

    const transcript = await elevenlabs.speechToText.transcripts.get(transcriptionId);

    res.json(transcript);
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
    const voices = await elevenlabs.voices.getAll();

    res.json(voices);
  } catch (error) {
    console.error('ElevenLabs voices error:', error);
    res.status(500).json({ 
      error: 'Failed to get voices',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

module.exports = { router };
