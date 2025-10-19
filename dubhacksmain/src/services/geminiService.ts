import axios from 'axios';

class GeminiService {
  private baseUrl = 'http://localhost:3001/api/gemini';

  constructor() {
    // Use backend API for Gemini calls
  }

  // Analyze interview transcript using Gemini
  async analyzeInterview(transcript: string, company: string, questionCount: number): Promise<any> {
    try {
      console.log('Starting Gemini interview analysis...');
      
      const response = await axios.post(`${this.baseUrl}/analyze-interview`, {
        transcript: transcript,
        company: company,
        questionCount: questionCount
      });

      console.log('Gemini analysis response:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error) {
      console.error('Error with Gemini interview analysis:', error);
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

export const geminiService = new GeminiService();
