import axios from 'axios';

class ElevenLabsService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:3001/api/elevenlabs';


  async textToSpeech(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<string> {
    try {
      console.log('Calling ElevenLabs TTS:', { text: text.substring(0, 50) + '...', voiceId, baseUrl: this.baseUrl });
      
      const response = await axios.post(`${this.baseUrl}/text-to-speech`, {
        text: text,
        voiceId: voiceId
      });

      console.log('ElevenLabs TTS response:', { status: response.status, hasAudio: !!response.data.audio });
      return response.data.audio;
    } catch (error) {
      console.error('Error with ElevenLabs text-to-speech:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('ElevenLabs TTS error details:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message: axiosError.message
        });
      }
      throw error;
    }
  }

  async getVoices(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`);
      return response.data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  // Get a professional voice suitable for interview questions
  async getInterviewVoice(): Promise<string> {
    // Use a hardcoded professional voice ID to avoid voices_read permission issue
    return 'pNInz6obpgDQGcFmaJgB'; // Adam - professional voice
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
      console.log('Starting ElevenLabs speech-to-text with audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type
      });

      const formData = new FormData();
      formData.append('audio', audioBlob);

      console.log('Sending request to:', `${this.baseUrl}/speech-to-text`);
      
      const response = await axios.post(`${this.baseUrl}/speech-to-text`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 90000, // 90 second timeout (tripled from 30 seconds)
      });

      console.log('ElevenLabs response:', {
        status: response.status,
        data: response.data
      });

      return response.data.text || '';
    } catch (error) {
      console.error('Error with ElevenLabs speech-to-text:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Response error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data
        });
      }
      throw error;
    }
  }
}

export const elevenLabsService = new ElevenLabsService();
