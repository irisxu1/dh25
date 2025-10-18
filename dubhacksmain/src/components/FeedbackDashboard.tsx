import React from 'react';
import { TrendingUp, TrendingDown, Mic, Clock, Volume2 } from 'lucide-react';

interface FeedbackDashboardProps {
  results: {
    voice: any;
    transcript: string;
    duration: number;
    question: string;
  };
}

const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ results }) => {
  const { voice, transcript, duration } = results;

  // Use real data from analysis results
  const realFeedback = {
    overallScore: Math.round(((voice?.clarity || 80) + (voice?.confidence || 70) + (voice?.confidence || 75)) / 3),
    voiceAnalysis: {
      fillerWords: voice?.fillerWords || 0,
      speakingRate: voice?.speakingRate || 140,
      volume: voice?.volume || 75,
      clarity: voice?.clarity || 80,
      sentiment: voice?.sentiment || 'neutral'
    },
    transcript: transcript || 'No transcript available',
    responseTime: duration || 0,
    strengths: generateStrengths(voice),
    improvements: generateImprovements(voice)
  };

  // Generate dynamic feedback based on actual results
  function generateStrengths(voice: any): string[] {
    const strengths = [];
    if (voice?.clarity && voice.clarity > 80) strengths.push("Clear and articulate speech");
    if (voice?.speakingRate && voice.speakingRate > 120 && voice.speakingRate < 160) strengths.push("Good speaking pace");
    if (voice?.sentiment === 'positive') strengths.push("Positive and confident tone");
    if (voice?.fillerWords && voice.fillerWords < 5) strengths.push("Minimal use of filler words");
    if (transcript && transcript.length > 50) strengths.push("Comprehensive response with good detail");
    if (strengths.length === 0) strengths.push("Good effort on your first attempt");
    return strengths;
  }

  function generateImprovements(voice: any): string[] {
    const improvements = [];
    if (voice?.fillerWords && voice.fillerWords > 8) improvements.push("Reduce filler words (um, uh, like)");
    if (voice?.speakingRate && voice.speakingRate > 160) improvements.push("Speak slightly slower for better clarity");
    if (voice?.speakingRate && voice.speakingRate < 100) improvements.push("Try speaking a bit faster to maintain engagement");
    if (voice?.volume && voice.volume < 70) improvements.push("Speak with more volume and confidence");
    if (voice?.clarity && voice.clarity < 75) improvements.push("Focus on clear pronunciation");
    if (transcript && transcript.length < 30) improvements.push("Provide more detailed examples in your responses");
    if (improvements.length === 0) improvements.push("Continue practicing to refine your skills");
    return improvements;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Interview Analysis Results</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getScoreBgColor(realFeedback.overallScore)} mb-2`}>
              <span className={`text-2xl font-bold ${getScoreColor(realFeedback.overallScore)}`}>
                {realFeedback.overallScore}
              </span>
            </div>
            <h3 className="font-semibold">Overall Score</h3>
            <p className="text-sm text-gray-600">out of 100</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-2">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold">Response Time</h3>
            <p className="text-sm text-gray-600">{realFeedback.responseTime}s</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-2">
              <Volume2 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold">Speaking Rate</h3>
            <p className="text-sm text-gray-600">{realFeedback.voiceAnalysis.speakingRate} WPM</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mic className="w-5 h-5 text-green-600" />
            Voice Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Filler Words</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{realFeedback.voiceAnalysis.fillerWords} detected</span>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Speaking Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{realFeedback.voiceAnalysis.speakingRate} WPM</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Volume Level</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{realFeedback.voiceAnalysis.volume}%</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Clarity</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{realFeedback.voiceAnalysis.clarity}%</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-600" />
            Your Response Transcript
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">
              {realFeedback.transcript}
            </p>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>📝 <strong>Transcript Quality:</strong> {realFeedback.transcript.length > 50 ? 'Good detail' : 'Could be more detailed'}</p>
            <p>🎯 <strong>Response Length:</strong> {realFeedback.transcript.length} characters</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-600">Strengths</h3>
          <ul className="space-y-2">
            {realFeedback.strengths.map((strength: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-orange-600">Areas for Improvement</h3>
          <ul className="space-y-2">
            {realFeedback.improvements.map((improvement: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDashboard;
