import axios from 'axios';

// interface ElevenLabsResponse {
//   audio: string; // Base64 encoded audio
//   isFinal: boolean;
// }

class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    // Your ElevenLabs API key
    this.apiKey = 'sk_80e980bf40026ecd7d283ab8683c973a52751516e9d0578f';
  }

  async textToSpeech(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_turbo_v2_5', // Using the latest Turbo model for better performance
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

  // Get a professional voice suitable for interview questions
  async getInterviewVoice(): Promise<string> {
    try {
      const voices = await this.getVoices();
      // Look for professional voices (Adam, Bella, etc.)
      const professionalVoices = voices.filter((voice: any) => 
        voice.name.toLowerCase().includes('adam') || 
        voice.name.toLowerCase().includes('bella') ||
        voice.name.toLowerCase().includes('professional')
      );
      
      if (professionalVoices.length > 0) {
        return professionalVoices[0].voice_id;
      }
      
      // Fallback to first available voice
      return voices.length > 0 ? voices[0].voice_id : 'pNInz6obpgDQGcFmaJgB';
    } catch (error) {
      console.error('Error getting interview voice:', error);
      return 'pNInz6obpgDQGcFmaJgB'; // Default professional voice
    }
  }

  async speechToSpeech(audioFile: File, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('voice_id', voiceId);
      formData.append('model_id', 'eleven_multilingual_v2'); // Using the latest multilingual model

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

  // Generate interview question audio with professional voice
  async generateQuestionAudio(question: string): Promise<HTMLAudioElement> {
    try {
      const voiceId = await this.getInterviewVoice();
      const base64Audio = await this.textToSpeech(question, voiceId);
      const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
      return audio;
    } catch (error) {
      console.error('Error generating question audio:', error);
      throw error;
    }
  }

  // Speech-to-text transcription using ElevenLabs
  async speechToText(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('model_id', 'whisper-1'); // Using Whisper model for transcription

      const response = await axios.post(
        `${this.baseUrl}/speech-to-text`,
        formData,
        {
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      return response.data.text || '';
    } catch (error) {
      console.error('Error with ElevenLabs speech-to-text:', error);
      throw error;
    }
  }
}

export const elevenLabsService = new ElevenLabsService();
