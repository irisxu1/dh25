const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");
const formidable = require('formidable');
const fs = require('fs');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.error('ELEVENLABS_API_KEY environment variable is required');
}

const elevenlabs = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 30 * 1024 * 1024, // 30MB
    });

    const [fields, files] = await form.parse(req);
    
    if (!files.audio || !files.audio[0]) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioFile = files.audio[0];
    const audioBuffer = fs.readFileSync(audioFile.filepath);
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });

    const transcription = await elevenlabs.speechToText.convert({
      file: audioBlob,
      modelId: "scribe_v1",
      tagAudioEvents: true,
      languageCode: "eng",
      diarize: true
    });

    let text = '';
    let transcriptionId = '';
    
    if (typeof transcription === 'string') {
      text = transcription;
    } else if (transcription && typeof transcription === 'object') {
      const response = transcription;
      text = response.text || response.transcript || '';
      transcriptionId = response.transcriptionId || response.id || '';
    }

    // Clean up temporary file
    fs.unlinkSync(audioFile.filepath);

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
};
