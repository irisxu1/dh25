const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.error('ELEVENLABS_API_KEY environment variable is required');
  module.exports = async (req, res) => {
    res.status(500).json({ 
      error: 'ElevenLabs API key not configured',
      details: 'ELEVENLABS_API_KEY environment variable is missing'
    });
  };
  return;
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
};
