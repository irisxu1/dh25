const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';

class ElevenLabsService {
  async textToSpeech(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<string> {
    if (!ELEVENLABS_API_KEY) throw new Error('REACT_APP_ELEVENLABS_API_KEY not set');

    const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        output_format: 'mp3_44100_128',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`ElevenLabs TTS failed: ${response.status} ${err}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  async getInterviewVoice(): Promise<string> {
    return 'pNInz6obpgDQGcFmaJgB'; // Adam - professional voice
  }

  playAudio(base64Audio: string) {
    const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
    return audio.play();
  }

  async generateQuestionAudio(question: string): Promise<HTMLAudioElement> {
    const voiceId = await this.getInterviewVoice();
    const base64Audio = await this.textToSpeech(question, voiceId);
    return new Audio(`data:audio/mpeg;base64,${base64Audio}`);
  }

  async speechToText(audioBlob: Blob): Promise<string> {
    if (!ELEVENLABS_API_KEY) throw new Error('REACT_APP_ELEVENLABS_API_KEY not set');

    console.log('Starting ElevenLabs speech-to-text:', { size: audioBlob.size, type: audioBlob.type });

    const formData = new FormData();
    formData.append('file', new File([audioBlob], 'audio.webm', { type: audioBlob.type || 'audio/webm' }));
    formData.append('model_id', 'scribe_v1');

    const response = await fetch(`${BASE_URL}/speech-to-text`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`ElevenLabs STT failed: ${response.status} ${err}`);
    }

    const data = await response.json();
    return data.text || '';
  }
}

export const elevenLabsService = new ElevenLabsService();
