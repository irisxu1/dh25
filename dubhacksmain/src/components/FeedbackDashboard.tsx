import React from 'react';
import { TrendingUp, TrendingDown, Eye, Mic, Clock, Volume2 } from 'lucide-react';

interface FeedbackDashboardProps {
  results: {
    voice: any;
    facial: any;
    duration: number;
    question: string;
  };
}

const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ results }) => {
  // const { voice, facial, duration, question } = results; // Will be used for real data

  // Mock data for demonstration - replace with actual analysis results
  const mockFeedback = {
    overallScore: 85,
    voiceAnalysis: {
      fillerWords: 12,
      speakingRate: 145, // words per minute
      volume: 75, // percentage
      clarity: 88
    },
    facialAnalysis: {
      eyeContact: 78, // percentage
      smileFrequency: 45,
      confidence: 82
    },
    responseTime: 3.2, // seconds
    strengths: [
      "Good use of specific examples",
      "Clear and articulate speech",
      "Maintained good posture"
    ],
    improvements: [
      "Reduce filler words (um, uh, like)",
      "Increase eye contact with camera",
      "Speak slightly slower for better clarity"
    ]
  };

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
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getScoreBgColor(mockFeedback.overallScore)} mb-2`}>
              <span className={`text-2xl font-bold ${getScoreColor(mockFeedback.overallScore)}`}>
                {mockFeedback.overallScore}
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
            <p className="text-sm text-gray-600">{mockFeedback.responseTime}s</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-2">
              <Volume2 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold">Speaking Rate</h3>
            <p className="text-sm text-gray-600">{mockFeedback.voiceAnalysis.speakingRate} WPM</p>
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
                <span className="text-sm text-gray-600">{mockFeedback.voiceAnalysis.fillerWords} detected</span>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Speaking Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{mockFeedback.voiceAnalysis.speakingRate} WPM</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Volume Level</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{mockFeedback.voiceAnalysis.volume}%</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Clarity</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{mockFeedback.voiceAnalysis.clarity}%</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Facial Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Eye Contact</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{mockFeedback.facialAnalysis.eyeContact}%</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Smile Frequency</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{mockFeedback.facialAnalysis.smileFrequency}%</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Confidence Level</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{mockFeedback.facialAnalysis.confidence}%</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-600">Strengths</h3>
          <ul className="space-y-2">
            {mockFeedback.strengths.map((strength, index) => (
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
            {mockFeedback.improvements.map((improvement, index) => (
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
