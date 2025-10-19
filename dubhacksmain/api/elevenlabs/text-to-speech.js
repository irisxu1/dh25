const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

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
};
