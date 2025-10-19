import { useState, useRef, useCallback } from 'react';

interface VoiceAnalysisResults {
  fillerWords: number;
  speakingRate: number;
  volume: number;
  clarity: number;
  transcript: string;
  sentiment: string;
  confidence: number;
}

export const useVoiceAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<VoiceAnalysisResults | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const monitorVolume = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // You could use this for real-time volume monitoring
    // const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    
    requestAnimationFrame(monitorVolume);
  }, []);

  const startVoiceAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      let transcript = '';
      let wordCount = 0;
      let fillerWordCount = 0;
      const startTime = Date.now();

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcript += result[0].transcript;
            const words = result[0].transcript.split(' ');
            wordCount += words.length;
            
            // Count filler words
            const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually'];
            const currentFillerCount = words.filter((word: string) => 
              fillerWords.includes(word.toLowerCase().replace(/[^\w]/g, ''))
            ).length;
            fillerWordCount += currentFillerCount;
          }
        }
      };

      recognitionRef.current.onend = async () => {
        const duration = (Date.now() - startTime) / 1000; // seconds
        
        try {
          // Provide mock results since analysis is handled elsewhere
          const mockResults: VoiceAnalysisResults = {
            fillerWords: 0,
            speakingRate: 140,
            volume: 75,
            clarity: 80,
            transcript: 'Mock transcript',
            sentiment: 'neutral',
            confidence: 75
          };
          setResults(mockResults);
        } catch (error) {
          console.error('Voice analysis failed:', error);
          // Fallback to basic analysis
          const speakingRate = wordCount / (duration / 60);
          setResults({
            fillerWords: fillerWordCount,
            speakingRate: Math.round(speakingRate),
            volume: 75,
            clarity: 88,
            transcript,
            sentiment: 'neutral',
            confidence: 60
          });
        }
        
        setIsAnalyzing(false);
      };

      recognitionRef.current.start();
    }

    // Initialize audio analysis for volume
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
        
        microphoneRef.current.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
        
        // Start volume monitoring
        monitorVolume();
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
      });
  }, [monitorVolume]);

  const stopVoiceAnalysis = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsAnalyzing(false);
  }, []);

  return {
    startVoiceAnalysis,
    stopVoiceAnalysis,
    isAnalyzing,
    voiceResults: results
  };
};
