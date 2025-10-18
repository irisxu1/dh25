import axios from 'axios';

interface ElevenLabsResponse {
  audio: string; // Base64 encoded audio
  isFinal: boolean;
}

class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    // Replace with your actual ElevenLabs API key
    this.apiKey = 'your-elevenlabs-api-key-here';
  }

  async textToSpeech(text: string, voiceId: string = 'default'): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'arraybuffer'
        }
      );

      // Convert audio buffer to base64
      const audioBuffer = Buffer.from(response.data);
      return audioBuffer.toString('base64');
    } catch (error) {
      console.error('Error with ElevenLabs text-to-speech:', error);
      throw error;
    }
  }

  async getVoices(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      return response.data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  async speechToSpeech(audioFile: File, voiceId: string = 'default'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('voice_id', voiceId);
      formData.append('model_id', 'eleven_multilingual_v1');

      const response = await axios.post(
        `${this.baseUrl}/speech-to-speech/${voiceId}`,
        formData,
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': this.apiKey
          },
          responseType: 'arraybuffer'
        }
      );

      const audioBuffer = Buffer.from(response.data);
      return audioBuffer.toString('base64');
    } catch (error) {
      console.error('Error with ElevenLabs speech-to-speech:', error);
      throw error;
    }
  }

  // Helper method to play audio from base64
  playAudio(base64Audio: string) {
    const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
    return audio.play();
  }

  // Generate interview question audio
  async generateQuestionAudio(question: string): Promise<HTMLAudioElement> {
    try {
      const base64Audio = await this.textToSpeech(question);
      const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
      return audio;
    } catch (error) {
      console.error('Error generating question audio:', error);
      throw error;
    }
  }
}

export const elevenLabsService = new ElevenLabsService();
