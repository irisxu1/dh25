import React, { useState } from 'react';
import { Mic, Video, BarChart3, Sparkles } from 'lucide-react';
import InterviewRecorder from './components/InterviewRecorder';
import FeedbackDashboard from './components/FeedbackDashboard';

type AppState = 'setup' | 'recording' | 'analyzing' | 'feedback';
export type Company = 'Amazon' | 'T-Mobile' | 'Atlassian' | 'Statsig' | 'ElevenLabs';

// Available companies with specific interview questions
const AVAILABLE_COMPANIES: Company[] = ['Amazon', 'T-Mobile', 'Atlassian', 'Statsig', 'ElevenLabs'];

function App() {
  const [currentState, setCurrentState] = useState<AppState>('setup');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company>('Amazon');

  const handleStartRecording = () => {
    setCurrentState('recording');
  };

  const handleStopRecording = (results: any) => {
    setCurrentState('analyzing');
    setAnalysisResults(results);
    // Simulate analysis time
    setTimeout(() => {
      setCurrentState('feedback');
    }, 2000);
  };

  const handleNewInterview = () => {
    setCurrentState('setup');
    setAnalysisResults(null);
  };

  const handleCancel = () => {
    setCurrentState('setup');
    setAnalysisResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            Rehearsal Room
          </h1>
          <p className="text-xl text-gray-600">
            Master your interviews with AI-powered voice and video analysis
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          {currentState === 'setup' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-pink-200">
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
                Ready to Practice?
              </h2>
              
              {/* Company Selection and Start Button */}
              <div className="text-center mb-8">
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Select Company:
                  </label>
                      <select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value as Company)}
                        className="border-2 border-pink-200 rounded-2xl px-6 py-3 text-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gradient-to-r from-pink-50 to-yellow-50"
                      >
                        {AVAILABLE_COMPANIES.map((company) => (
                          <option key={company} value={company}>{company}</option>
                        ))}
                      </select>
                </div>
                <button
                  onClick={handleStartRecording}
                  className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white px-16 py-6 rounded-2xl font-bold text-2xl transition-all transform hover:scale-105 shadow-xl"
                >
                  Start Practice Interview
                </button>
              </div>

              {/* Features Section */}
              <div className="border-t-2 border-pink-100 pt-8">
                <h3 className="text-xl font-semibold text-center mb-6 text-gray-700">
                  Key Features
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 border-2 border-pink-200 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100">
                    <Video className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                    <h4 className="font-bold mb-2 text-pink-700">Video Recording</h4>
                    <p className="text-sm text-pink-600">
                      Record your answers and review your performance
                    </p>
                  </div>
                  <div className="text-center p-6 border-2 border-yellow-200 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <Mic className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                    <h4 className="font-bold mb-2 text-yellow-700">Voice Analysis</h4>
                    <p className="text-sm text-yellow-600">
                      Monitor filler words and speaking pace
                    </p>
                  </div>
                  <div className="text-center p-6 border-2 border-pink-200 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                    <h4 className="font-bold mb-2 text-pink-700">STAR Analysis</h4>
                    <p className="text-sm text-pink-600">
                      Get detailed feedback on your responses
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentState === 'recording' && (
            <InterviewRecorder 
              company={selectedCompany}
              onStop={handleStopRecording}
              onCancel={handleCancel}
            />
          )}

          {currentState === 'analyzing' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-pink-200">
              <div className="animate-spin w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
                ✨ Analyzing Your Performance ✨
              </h2>
              <p className="text-lg text-gray-600">🎬 Processing your video and voice data...</p>
            </div>
          )}

          {currentState === 'feedback' && analysisResults && (
            <FeedbackDashboard results={analysisResults} onRedo={handleNewInterview} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
