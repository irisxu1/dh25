import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Mic, Clock, Sparkles } from 'lucide-react';
import { elevenLabsService } from '../services/elevenLabsService';
import { geminiService } from '../services/geminiService';
import type { Company } from '../App';

interface InterviewRecorderProps {
  company: Company;
  onStop: (results: any) => void;
  onCancel: () => void;
}

// Company-specific question sets
const COMPANY_QUESTIONS: Record<Company, string[]> = {
  Amazon: [
    "Describe a time when you used data to make a decision.",
    "Tell me about a time you disagreed with your manager. How did you handle it?",
    "Describe a situation where you had to prioritize multiple tasks.",
    "Give an example of when you went above and beyond for a customer.",
    "How do you handle tight deadlines while maintaining quality?",
  ],
  "T-Mobile": [
    "How would you handle a dissatisfied customer?",
    "Tell me about a time you collaborated with a team to meet a goal.",
    "Describe a situation where innovation led to success.",
    "How do you keep yourself motivated in a fast-paced environment?",
    "What does the T-Mobile brand mean to you?",
  ],
  Atlassian: [
    "Describe a time when you improved a process or workflow.",
    "How do you handle feedback from multiple stakeholders?",
    "Tell me about a technical project you’re proud of.",
    "How do you ensure collaboration within distributed teams?",
    "Which Atlassian product do you admire and why?",
  ],
  ElevenLabs: [
    "What excites you about voice AI and speech synthesis?",
    "Tell me about a project where you used AI or ML tools.",
    "Describe a time when creativity helped you solve a technical challenge.",
    "How would you evaluate the quality of generated voice data?",
    "How do you stay current with advances in AI research?",
  ],
  Statsig: [
    "What is your experience with A/B testing or experimentation?",
    "Tell me about a time you used data to validate an assumption.",
    "How would you design an experiment to test a new product feature?",
    "Describe a situation where data contradicted your expectations.",
    "How would you explain statistical significance to a non-technical audience?",
  ],
};


export default function InterviewRecorder({ company, onStop, onCancel }: InterviewRecorderProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // Use the questions for the selected company
  const QUESTIONS = COMPANY_QUESTIONS[company];
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(5);
  const [recordingTime, setRecordingTime] = useState(0);
  const [status, setStatus] = useState('Click "Ask Question" to begin.');
  const [recordings, setRecordings] = useState<any[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestionRef = useRef<number>(0);

  // Update the ref whenever currentQuestion changes
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);



  useEffect(() => {
    let isMounted = true;
    
    // Setup camera and microphone access
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 16/9 }
          },
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
            setStatus('No recording data captured. Please try again.');
            return;
          }
          
          const videoBlob = new Blob(chunksRef.current, { type: mimeType });
          chunksRef.current = [];
          
          // Create video URL for playback
          const videoUrl = URL.createObjectURL(videoBlob);
          
          // Get current question from ref
          const currentQ = currentQuestionRef.current;
          
          // Save video locally with company naming
          const fileName = `${company.toLowerCase().replace(/\s+/g, '')}q${currentQ + 1}.webm`;
          const link = document.createElement('a');
          link.href = videoUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Store the video recording
          setRecordings(prev => [...prev, {
            questionNumber: currentQ + 1,
            question: QUESTIONS[currentQ],
            videoUrl,
            videoBlob,
            size: videoBlob.size,
            fileName: fileName
          }]);
          
          // Progress to next question immediately (don't wait for transcription)
          // But if it's the last question, wait for transcription to complete
          const nextQuestion = currentQuestionRef.current + 1;
          const isLastQuestion = nextQuestion >= QUESTIONS.length;
          
          if (isLastQuestion) {
            // For the last question, show completion status and wait for user to go to summary
            console.log('Last question completed, showing completion status');
            setStatus('Interview completed! Click "Go to Summary" when ready.');
          } else {
            // For other questions, progress immediately
            setTimeout(() => {
              console.log('Progressing from question', currentQuestionRef.current, 'to', nextQuestion, 'of', QUESTIONS.length, 'total questions');
              if (QUESTIONS.length === 0) {
                console.log('Questions not loaded, cannot progress');
                return;
              }
              setCurrentQuestion(nextQuestion);
              setStatus('Click "Ask Question" for the next question.');
            }, 1000);
          }
          
          // No transcription during recording - will be done at summary time
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
  }, [company]); // Added company dependency since we're using company-specific questions

  // Helper function to extract audio from video for transcription
  const extractAudioFromVideo = async (videoBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      console.log('Extracting audio from video blob:', videoBlob.size, 'bytes, type:', videoBlob.type);
      
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const audioContext = new AudioContext();
      
      video.src = URL.createObjectURL(videoBlob);
      
      video.onloadedmetadata = () => {
        console.log('Video metadata loaded:', {
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight
        });
        
        // For now, return the video blob as audio
        // In a real implementation, you'd extract just the audio track
        // This is a simplified approach - the backend will handle the audio extraction
        resolve(videoBlob);
      };
      
      video.onerror = (error) => {
        console.error('Error loading video for audio extraction:', error);
        reject(new Error('Failed to load video for audio extraction'));
      };
      
      // Set a timeout to prevent hanging
      setTimeout(() => {
        if (!video.duration) {
          console.warn('Video metadata loading timed out, using video blob directly');
          resolve(videoBlob);
        }
      }, 5000);
    });
  };

  const askQuestion = async () => {
    console.log('Ask question called - currentQuestion:', currentQuestion, 'QUESTIONS.length:', QUESTIONS.length, 'QUESTIONS array:', QUESTIONS);
    if (QUESTIONS.length === 0) {
      console.log('Questions not loaded yet, waiting...');
      return;
    }
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

  const nextQuestion = () => {
    console.log('Next question called - currentQuestion:', currentQuestion, 'QUESTIONS.length:', QUESTIONS.length);
    if (QUESTIONS.length === 0) {
      console.log('Questions not loaded, cannot progress');
      return;
    }
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setStatus('Click "Ask Question" for the next question.');
    } else {
      setStatus('Analyzing your interview...');
      analyzeInterview();
    }
  };

  const goToSummary = () => {
    console.log('Go to summary called - currentQuestion:', currentQuestion, 'QUESTIONS.length:', QUESTIONS.length);
    setStatus('Analyzing your interview...');
    analyzeInterview();
  };

  const startRecording = () => {
    // Clear any existing recording timer first
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    // Always set recording state to true first, regardless of MediaRecorder state
    setIsRecording(true);
    setRecordingTime(0);
    setStatus('Recording your answer...');
    chunksRef.current = [];
    
    // Start recording timer immediately
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    if (!mediaRecorderRef.current) {
      return;
    }
    
    // Check if MediaRecorder is already recording
    if (mediaRecorderRef.current.state === 'recording') {
      return;
    }
    
    // Check if MediaRecorder is in a valid state
    if (mediaRecorderRef.current.state === 'inactive') {
      try {
        mediaRecorderRef.current.start(100); // Start with 100ms timeslice
      } catch (error) {
        console.error('Failed to start MediaRecorder:', error);
        // Don't set isRecording to false here - keep the button showing
      }
    }
  };

  const stopRecording = async () => {
    if (!isRecording) {
      return;
    }
    
    setIsRecording(false);
    setStatus('Processing your answer...');
    
    // Stop recording timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    // Try to stop MediaRecorder if it exists and is recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
        
        // The onstop event handler will handle the rest
        // We don't need to manually progress here as it's handled in the onstop callback
        
      } catch (error) {
        console.error('Failed to stop recording:', error);
        setStatus('Failed to stop recording. Please try again.');
      }
    } else {
      // If MediaRecorder wasn't actually recording, manually progress to next question
      setTimeout(() => {
        const nextQuestion = currentQuestionRef.current + 1;
        if (QUESTIONS.length === 0) {
          console.log('Questions not loaded, cannot progress manually');
          return;
        }
        if (nextQuestion < QUESTIONS.length) {
          setCurrentQuestion(nextQuestion);
          setStatus('Click "Ask Question" for the next question.');
        } else {
          // All questions completed, analyze with OpenAI
          setStatus('Analyzing your interview...');
          analyzeInterview();
        }
      }, 1000);
    }
  };

  const analyzeInterview = async () => {
    console.log('Analyzing interview - currentQuestion:', currentQuestion, 'QUESTIONS.length:', QUESTIONS.length, 'recordings count:', recordings.length);
    
    setStatus('Transcribing all your answers...');
    
    try {
      // Transcribe all recordings using ElevenLabs
      let fullTranscript = '';
      
      for (let i = 0; i < recordings.length; i++) {
        const recording = recordings[i];
        setStatus(`Transcribing answer ${i + 1} of ${recordings.length}...`);
        
        try {
          // Extract audio from video and transcribe
          const audioBlob = await extractAudioFromVideo(recording.videoBlob);
          console.log(`Extracted audio for Q${recording.questionNumber}:`, audioBlob.size, 'bytes');
          
          const transcription = await elevenLabsService.speechToText(audioBlob);
          const answerText = transcription || '[No speech detected]';
          
          console.log(`Transcription for Q${recording.questionNumber}:`, answerText);
          
          // Save transcription to file for debugging
          const transcriptionData = {
            questionNumber: recording.questionNumber,
            question: recording.question,
            transcription: answerText,
            audioSize: audioBlob.size,
            timestamp: new Date().toISOString(),
            fileName: recording.fileName
          };
          
          // Save as JSON file
          const transcriptionBlob = new Blob([JSON.stringify(transcriptionData, null, 2)], { type: 'application/json' });
          const transcriptionUrl = URL.createObjectURL(transcriptionBlob);
          const transcriptionFileName = `transcription_q${recording.questionNumber}_${company.toLowerCase().replace(/\s+/g, '')}.json`;
          
          const transcriptionLink = document.createElement('a');
          transcriptionLink.href = transcriptionUrl;
          transcriptionLink.download = transcriptionFileName;
          document.body.appendChild(transcriptionLink);
          transcriptionLink.click();
          document.body.removeChild(transcriptionLink);
          
          // Also save as text file
          const textBlob = new Blob([`Question ${recording.questionNumber}: ${recording.question}\n\nAnswer: ${answerText}\n\nAudio Size: ${audioBlob.size} bytes\nTimestamp: ${new Date().toISOString()}`], { type: 'text/plain' });
          const textUrl = URL.createObjectURL(textBlob);
          const textFileName = `transcription_q${recording.questionNumber}_${company.toLowerCase().replace(/\s+/g, '')}.txt`;
          
          const textLink = document.createElement('a');
          textLink.href = textUrl;
          textLink.download = textFileName;
          document.body.appendChild(textLink);
          textLink.click();
          document.body.removeChild(textLink);
          
          console.log(`Saved transcription files for Q${recording.questionNumber}: ${transcriptionFileName} and ${textFileName}`);
          
          // Add to transcript
          fullTranscript += `\nQ${recording.questionNumber}: ${recording.question}\nA${recording.questionNumber}: ${answerText}\n`;
        } catch (error) {
          console.error(`Transcription failed for question ${recording.questionNumber}:`, error);
          
          // Save error information to file
          const errorData = {
            questionNumber: recording.questionNumber,
            question: recording.question,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            fileName: recording.fileName
          };
          
          const errorBlob = new Blob([JSON.stringify(errorData, null, 2)], { type: 'application/json' });
          const errorUrl = URL.createObjectURL(errorBlob);
          const errorFileName = `transcription_error_q${recording.questionNumber}_${company.toLowerCase().replace(/\s+/g, '')}.json`;
          
          const errorLink = document.createElement('a');
          errorLink.href = errorUrl;
          errorLink.download = errorFileName;
          document.body.appendChild(errorLink);
          errorLink.click();
          document.body.removeChild(errorLink);
          
          console.log(`Saved error file for Q${recording.questionNumber}: ${errorFileName}`);
          
          fullTranscript += `\nQ${recording.questionNumber}: ${recording.question}\nA${recording.questionNumber}: [Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}]\n`;
        }
      }
      
      setStatus('Analyzing your interview responses...');
      
      // Save complete transcript summary for debugging
      const summaryData = {
        company: company,
        totalQuestions: QUESTIONS.length,
        totalRecordings: recordings.length,
        fullTranscript: fullTranscript,
        recordings: recordings.map(r => ({
          questionNumber: r.questionNumber,
          question: r.question,
          fileName: r.fileName,
          size: r.size
        })),
        timestamp: new Date().toISOString()
      };
      
      const summaryBlob = new Blob([JSON.stringify(summaryData, null, 2)], { type: 'application/json' });
      const summaryUrl = URL.createObjectURL(summaryBlob);
      const summaryFileName = `interview_summary_${company.toLowerCase().replace(/\s+/g, '')}_${new Date().toISOString().split('T')[0]}.json`;
      
      const summaryLink = document.createElement('a');
      summaryLink.href = summaryUrl;
      summaryLink.download = summaryFileName;
      document.body.appendChild(summaryLink);
      summaryLink.click();
      document.body.removeChild(summaryLink);
      
      console.log(`Saved interview summary: ${summaryFileName}`);
      
      // Now analyze the complete transcript using Gemini
      const analysis = await geminiService.analyzeInterview(fullTranscript, company, QUESTIONS.length);

      onStop({
        company,
        transcript: fullTranscript,
        recordings,
        ...analysis,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      onStop({
        company,
        transcript: 'Analysis failed - could not transcribe recordings',
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
        <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                Question {currentQuestion + 1} of {QUESTIONS.length}
              </div>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Current Question Display */}
      {QUESTIONS.length > 0 && currentQuestion < QUESTIONS.length && (
        <div className="bg-gradient-to-r from-pink-50 to-yellow-50 rounded-2xl p-6 border border-pink-200">
          <h3 className="font-bold text-pink-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            {currentQuestion === QUESTIONS.length - 1 ? 'Final Question:' : 'Current Question:'}
          </h3>
          <p className="text-pink-700 text-lg leading-relaxed">{QUESTIONS[currentQuestion]}</p>
          {currentQuestion === QUESTIONS.length - 1 && (
            <p className="text-pink-600 text-sm mt-2 font-medium">
              🎉 This is your last question! You can end the interview anytime.
            </p>
          )}
        </div>
      )}

      {/* Status Display */}
      <div className="p-4 bg-gradient-to-r from-pink-50 to-yellow-50 rounded-2xl border border-pink-200">
        <p className="text-sm text-pink-700 font-medium">{status}</p>
        {isRecording && (
          <div className="mt-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-600 font-bold">Recording: {formatTime(recordingTime)}</span>
          </div>
        )}
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
          className="w-full h-[32rem] object-cover transform scale-x-[-1]"
          style={{ transform: 'scaleX(-1)' }}
        />
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-bold">🎬 REC {formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center">
            {!isThinking && !isRecording && QUESTIONS.length > 0 && currentQuestion < QUESTIONS.length && status.includes('Ask Question') && (
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
                className="px-10 py-5 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 animate-pulse"
                onClick={stopRecording}
              >
                <Square className="w-7 h-7" />
                🛑 Stop Recording ({formatTime(recordingTime)})
              </button>
            )}

            {/* Fallback Next Question button */}
            {!isThinking && !isRecording && QUESTIONS.length > 0 && currentQuestion < QUESTIONS.length - 1 && status.includes('Processing') && (
              <button
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                onClick={nextQuestion}
              >
                <Play className="w-6 h-6" />
                ➡️ Next Question
              </button>
            )}

            {/* Go to Summary button for last question */}
            {!isThinking && !isRecording && QUESTIONS.length > 0 && currentQuestion === QUESTIONS.length - 1 && status.includes('Processing') && (
              <button
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                onClick={goToSummary}
              >
                <Sparkles className="w-6 h-6" />
                ✨ Go to Summary
              </button>
            )}

            {/* Manual Go to Summary button for last question when ready */}
            {!isThinking && !isRecording && QUESTIONS.length > 0 && currentQuestion === QUESTIONS.length - 1 && status.includes('Ask Question') && (
              <button
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                onClick={goToSummary}
              >
                <Sparkles className="w-6 h-6" />
                ✨ End Interview & Go to Summary
              </button>
            )}

            {/* Go to Summary button after completing the last question */}
            {!isThinking && !isRecording && QUESTIONS.length > 0 && currentQuestion === QUESTIONS.length - 1 && status.includes('Interview completed') && (
              <button
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                onClick={goToSummary}
              >
                <Sparkles className="w-6 h-6" />
                🎯 Go to Summary Now
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