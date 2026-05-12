import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;

function getClient() {
  if (!ELEVENLABS_API_KEY) {
    console.warn('REACT_APP_ELEVENLABS_API_KEY not set');
    return null;
  }
  return new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });
}

class ElevenLabsService {
  async textToSpeech(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<string> {
    const client = getClient();
    if (!client) throw new Error('ElevenLabs API key not configured');

    const audioStream = await client.textToSpeech.convert(voiceId, {
      text,
      model_id: 'eleven_monolingual_v1',
      output_format: 'mp3_44100_128',
    });

    // Collect stream into bytes
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const merged = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to base64
    let binary = '';
    for (let i = 0; i < merged.length; i++) {
      binary += String.fromCharCode(merged[i]);
    }
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
    const client = getClient();
    if (!client) throw new Error('ElevenLabs API key not configured');

    console.log('Starting ElevenLabs speech-to-text:', { size: audioBlob.size, type: audioBlob.type });

    const file = new File([audioBlob], 'audio.webm', { type: audioBlob.type || 'audio/webm' });

    const result = await client.speechToText.convert({
      file,
      model_id: 'scribe_v1',
    });

    return result.text || '';
  }
}

export const elevenLabsService = new ElevenLabsService();
