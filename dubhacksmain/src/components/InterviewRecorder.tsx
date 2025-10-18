import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Mic, Video } from 'lucide-react';
import { useVoiceAnalysis } from '../hooks/useVoiceAnalysis';
import { elevenLabsService } from '../services/elevenLabsService';

interface InterviewRecorderProps {
  onStop: (results: any) => void;
}

const InterviewRecorder: React.FC<InterviewRecorderProps> = ({ onStop }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { startVoiceAnalysis, stopVoiceAnalysis, voiceResults } = useVoiceAnalysis();
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);

  const questions = [
    "Tell me about yourself and your background.",
    "What are your greatest strengths?",
    "Describe a challenging situation you've faced and how you handled it.",
    "Where do you see yourself in 5 years?",
    "Why do you want to work for our company?"
  ];

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startVoiceAnalysis();
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Please allow camera and microphone access to continue.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      stopVoiceAnalysis();

      // Combine results
      const results = {
        voice: voiceResults,
        transcript: voiceResults?.transcript || '',
        duration: recordingTime,
        question: questions[currentQuestion]
      };

      onStop(results);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playQuestionWithAI = async () => {
    if (isPlayingQuestion) return;
    
    setIsPlayingQuestion(true);
    try {
      const audio = await elevenLabsService.generateQuestionAudio(questions[currentQuestion]);
      if (audio) {
        audio.onended = () => setIsPlayingQuestion(false);
        audio.onerror = () => setIsPlayingQuestion(false);
        await audio.play();
      } else {
        setIsPlayingQuestion(false);
      }
    } catch (error) {
      console.error('Failed to play AI voice:', error);
      setIsPlayingQuestion(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-4">Practice Interview</h2>
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-2">Question {currentQuestion + 1}:</h3>
          <p className="text-gray-700 mb-3">{questions[currentQuestion]}</p>
          <button
            onClick={playQuestionWithAI}
            disabled={isPlayingQuestion}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <Play className="w-4 h-4" />
            {isPlayingQuestion ? 'Playing...' : 'Play with AI Voice'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-64 object-cover"
            />
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">REC</span>
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              {formatTime(recordingTime)}
            </div>
          </div>
        </div>

        <div className="md:w-80">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mic className="w-4 h-4" />
              <span>Voice analysis active</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Video className="w-4 h-4" />
              <span>Video recording active</span>
            </div>
            
            <div className="pt-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  Stop Recording
                </button>
              )}
            </div>

            <div className="text-sm text-gray-500">
              <p>• Look directly at the camera</p>
              <p>• Speak clearly and at a good pace</p>
              <p>• Use specific examples in your answers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRecorder;
