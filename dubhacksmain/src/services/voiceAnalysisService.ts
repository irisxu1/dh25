import { elevenLabsService } from './elevenLabsService';

interface VoiceAnalysisResult {
  fillerWords: number;
  speakingRate: number;
  volume: number;
  clarity: number;
  transcript: string;
  sentiment: string;
  confidence: number;
}

class VoiceAnalysisService {
  private fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 'basically', 'literally'];

  async analyzeVoice(audioBlob: Blob, transcript: string): Promise<VoiceAnalysisResult> {
    try {
      let finalTranscript = transcript;
      let confidence = 75;
      
      // Use ElevenLabs for transcription if we have audio
      try {
        const elevenLabsTranscript = await elevenLabsService.speechToText(audioBlob);
        if (elevenLabsTranscript && elevenLabsTranscript.trim().length > 0) {
          finalTranscript = elevenLabsTranscript;
          confidence = 90; // Higher confidence with ElevenLabs transcription
        }
      } catch (error) {
        console.log('ElevenLabs transcription failed, using basic transcript:', error);
      }
      
      // Basic analysis from transcript
      const words = finalTranscript.toLowerCase().split(/\s+/);
      const fillerWordCount = this.countFillerWords(words);
      const speakingRate = this.calculateSpeakingRate(words, 30); // Assume 30 seconds for now
      
      // Analyze sentiment
      const sentiment = this.analyzeSentiment(finalTranscript);

      return {
        fillerWords: fillerWordCount,
        speakingRate: Math.round(speakingRate),
        volume: this.estimateVolume(audioBlob),
        clarity: this.estimateClarity(finalTranscript),
        transcript: finalTranscript,
        sentiment,
        confidence
      };
    } catch (error) {
      console.error('Voice analysis error:', error);
      // Return fallback analysis
      return this.getFallbackAnalysis(transcript);
    }
  }

  private countFillerWords(words: string[]): number {
    return words.filter(word => 
      this.fillerWords.includes(word.replace(/[^\w]/g, ''))
    ).length;
  }

  private calculateSpeakingRate(words: string[], durationSeconds: number): number {
    const durationMinutes = durationSeconds / 60;
    return words.length / durationMinutes;
  }

  private estimateVolume(audioBlob: Blob): number {
    // This is a simplified volume estimation
    // In a real implementation, you'd analyze the audio data
    const size = audioBlob.size;
    if (size > 100000) return 85; // Large file = loud
    if (size > 50000) return 75;  // Medium file = medium
    return 65; // Small file = quiet
  }

  private estimateClarity(transcript: string): number {
    // Simple clarity estimation based on transcript quality
    const words = transcript.split(/\s+/);
    const clearWords = words.filter(word => word.length > 1 && /^[a-zA-Z]+$/.test(word));
    return Math.round((clearWords.length / words.length) * 100);
  }

  private analyzeSentiment(transcript: string): string {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'confident', 'excited'];
    const negativeWords = ['bad', 'terrible', 'awful', 'nervous', 'worried', 'scared', 'difficult'];
    
    const words = transcript.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private getFallbackAnalysis(transcript: string): VoiceAnalysisResult {
    const words = transcript.split(/\s+/);
    return {
      fillerWords: this.countFillerWords(words),
      speakingRate: 140,
      volume: 75,
      clarity: 80,
      transcript,
      sentiment: 'neutral',
      confidence: 60
    };
  }

  // Generate AI voice for interview questions
  async generateQuestionVoice(question: string): Promise<HTMLAudioElement | null> {
    try {
      return await elevenLabsService.generateQuestionAudio(question);
    } catch (error) {
      console.error('Failed to generate AI voice:', error);
      return null;
    }
  }
}

export const voiceAnalysisService = new VoiceAnalysisService();
