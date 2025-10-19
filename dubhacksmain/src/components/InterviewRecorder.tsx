import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Mic, Video, Clock, Sparkles } from 'lucide-react';
import { elevenLabsService } from '../services/elevenLabsService';
import { analyzeTranscriptWithGemini } from '../services/voiceAnalysisService';
import type { Company } from '../App';

interface InterviewRecorderProps {
  company: Company;
  onStop: (results: any) => void;
}

const QUESTIONS = [
  "Tell me about yourself and your background.",
  "What are your greatest strengths?",
  "Describe a challenging situation you've faced and how you handled it.",
  "Where do you see yourself in 5 years?",
  "Why do you want to work for our company?"
];

export default function InterviewRecorder({ company, onStop }: InterviewRecorderProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(30);
  const [recordingTime, setRecordingTime] = useState(0);
  const [status, setStatus] = useState('Click "Ask Question" to begin.');
  const [transcript, setTranscript] = useState<string>('');
  const [recordings, setRecordings] = useState<any[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Setup camera and microphone access
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 },
          audio: true 
        });
        
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        streamRef.current = stream;
        
        // Set up video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Check for supported MIME types
        let mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
          }
        }
        
        const mr = new MediaRecorder(stream, {
          mimeType: mimeType
        });
        
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };
        
        mr.onstop = async () => {
          if (chunksRef.current.length === 0) {
            console.log('No audio/video data recorded');
            setStatus('No recording data captured. Please try again.');
            return;
          }
          
          const videoBlob = new Blob(chunksRef.current, { type: mimeType });
          chunksRef.current = [];
          
          // Create video URL for playback
          const videoUrl = URL.createObjectURL(videoBlob);
          
          // Store the video recording
          setRecordings(prev => [...prev, {
            questionNumber: currentQuestion + 1,
            question: QUESTIONS[currentQuestion],
            videoUrl,
            videoBlob,
            size: videoBlob.size
          }]);
          
          // Extract audio for transcription
          const audioBlob = await extractAudioFromVideo(videoBlob);
          
          // Transcribe the audio
          setStatus('Transcribing your answer...');
          try {
            const transcription = await elevenLabsService.speechToText(audioBlob);
            const answerText = transcription || '';
            
            // Store the answer for this question
            setTranscript(prev => prev + `\nQ${currentQuestion + 1}: ${QUESTIONS[currentQuestion]}\nA${currentQuestion + 1}: ${answerText}\n`);
          } catch (error) {
            console.error('Transcription failed:', error);
            setTranscript(prev => prev + `\nQ${currentQuestion + 1}: ${QUESTIONS[currentQuestion]}\nA${currentQuestion + 1}: [Transcription failed]\n`);
          }
        };
        
        mediaRecorderRef.current = mr;
        setStatus('Ready to start interview. Click "Ask Question" to begin.');
        
      } catch (error) {
        console.error('Media setup failed:', error);
        setStatus('Camera/Microphone permission denied or not available.');
      }
    };
    
    setupMedia();

    // Cleanup function
    return () => {
      isMounted = false;
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Helper function to extract audio from video for transcription
  const extractAudioFromVideo = async (videoBlob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const audioContext = new AudioContext();
      
      video.src = URL.createObjectURL(videoBlob);
      video.onloadedmetadata = () => {
        // For now, return the video blob as audio
        // In a real implementation, you'd extract just the audio track
        resolve(videoBlob);
      };
    });
  };

  const askQuestion = async () => {
    if (currentQuestion >= QUESTIONS.length) return;
    
    const question = QUESTIONS[currentQuestion];
    setStatus('Interviewer is asking the question...');
    
    try {
      const audio = await elevenLabsService.generateQuestionAudio(question);
      await audio.play();
      startThinkingTimer();
    } catch (error) {
      console.error('Failed to play question:', error);
      startThinkingTimer();
    }
  };

  const startThinkingTimer = () => {
    setIsThinking(true);
    setThinkingTime(5);
    setStatus('Think about your answer (5 seconds)...');
    
    thinkingTimerRef.current = setInterval(() => {
      setThinkingTime(prev => {
        if (prev <= 1) {
          clearInterval(thinkingTimerRef.current!);
          setIsThinking(false);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipThinking = () => {
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current);
    }
    setIsThinking(false);
    setThinkingTime(0);
    startRecording();
  };

  const startRecording = () => {
    if (!mediaRecorderRef.current) {
      console.log('MediaRecorder not initialized');
      setStatus('MediaRecorder not ready. Please wait and try again.');
      return;
    }
    
    // Check if MediaRecorder is already recording
    if (mediaRecorderRef.current.state === 'recording') {
      console.log('MediaRecorder is already recording');
      return;
    }
    
    // Check if MediaRecorder is in a valid state
    if (mediaRecorderRef.current.state === 'inactive') {
      setIsRecording(true);
      setRecordingTime(0);
      setStatus('Recording your answer...');
      chunksRef.current = [];
      
      try {
        mediaRecorderRef.current.start(100); // Start with 100ms timeslice
        console.log('Recording started successfully');
        
        // Start recording timer
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } catch (error) {
        console.error('Failed to start recording:', error);
        setIsRecording(false);
        setStatus('Failed to start recording. Please try again.');
      }
    } else {
      console.log('MediaRecorder in invalid state:', mediaRecorderRef.current.state);
      setStatus('MediaRecorder not ready. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    
    // Check if MediaRecorder is actually recording
    if (mediaRecorderRef.current.state !== 'recording') {
      console.log('MediaRecorder is not recording');
      setIsRecording(false);
      return;
    }
    
    setIsRecording(false);
    setStatus('Processing your answer...');
    
    // Stop recording timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    try {
      mediaRecorderRef.current.stop();
      
      // Wait a moment for transcription to complete
      setTimeout(() => {
        if (currentQuestion < QUESTIONS.length - 1) {
          setCurrentQuestion(prev => prev + 1);
          setStatus('Click "Ask Question" for the next question.');
        } else {
          // All questions completed, analyze with Gemini
          setStatus('Analyzing your interview...');
          analyzeInterview();
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setStatus('Failed to stop recording. Please try again.');
    }
  };

  const analyzeInterview = async () => {
    try {
      const analysis = await analyzeTranscriptWithGemini(transcript, {
        company: company,
        questionCount: QUESTIONS.length
      });

      onStop({
        company,
        transcript,
        recordings,
        ...analysis,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      onStop({
        company,
        transcript,
        recordings,
        summary: 'Analysis failed',
        metrics: { fillerWords: 0, speakingRateWpm: 0 },
        questionAnalysis: [],
        decision: { pass: false, rationale: 'Analysis failed' }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-pink-200">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
          ✨ Interview Practice ✨
        </h2>
        <div className="text-sm font-medium text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </div>
      </div>

      {/* Current Question Display */}
      {currentQuestion < QUESTIONS.length && (
        <div className="bg-gradient-to-r from-pink-50 to-yellow-50 rounded-2xl p-6 border border-pink-200">
          <h3 className="font-bold text-pink-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            Current Question:
          </h3>
          <p className="text-pink-700 text-lg leading-relaxed">{QUESTIONS[currentQuestion]}</p>
        </div>
      )}

      {/* Status Display */}
      <div className="p-4 bg-gradient-to-r from-pink-50 to-yellow-50 rounded-2xl border border-pink-200">
        <p className="text-sm text-pink-700 font-medium">{status}</p>
      </div>

      {/* Timer Display */}
      {(isThinking || isRecording) && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-pink-100 text-pink-800 px-6 py-3 rounded-2xl border border-pink-200">
            <Clock className="w-5 h-5" />
            <span className="font-bold text-lg">
              {isThinking ? `💭 Think: ${thinkingTime}s` : `🎬 Recording: ${formatTime(recordingTime)}`}
            </span>
          </div>
        </div>
      )}

      {/* Video Display */}
      <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-pink-200">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-64 object-cover"
        />
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-bold">🎬 REC</span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 justify-center">
        {!isThinking && !isRecording && currentQuestion < QUESTIONS.length && (
          <button
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold hover:from-pink-600 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            onClick={askQuestion}
          >
            <Play className="w-6 h-6" />
            🎤 Ask Question
          </button>
        )}
        
        {isThinking && (
          <button
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            onClick={skipThinking}
          >
            <Mic className="w-6 h-6" />
            ⚡ Skip & Start Recording
          </button>
        )}
        
        {isRecording && (
          <button
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            onClick={stopRecording}
          >
            <Square className="w-6 h-6" />
            🛑 Stop Recording
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="w-full bg-gradient-to-r from-pink-100 to-yellow-100 rounded-full h-3 border border-pink-200">
        <div 
          className="bg-gradient-to-r from-pink-500 to-yellow-500 h-3 rounded-full transition-all duration-300 shadow-sm"
          style={{ width: `${Math.min(100, ((currentQuestion + 1) / QUESTIONS.length) * 100)}%` }}
        ></div>
      </div>
    </div>
  );
}