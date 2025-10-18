import React, { useState } from 'react';
import { Mic, Video, BarChart3 } from 'lucide-react';
import InterviewRecorder from './components/InterviewRecorder';
import FeedbackDashboard from './components/FeedbackDashboard';

type AppState = 'setup' | 'recording' | 'analyzing' | 'feedback';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('setup');
  const [analysisResults, setAnalysisResults] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            InterviewPrep AI
          </h1>
          <p className="text-lg text-gray-600">
            Master your interviews with AI-powered voice and facial analysis
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          {currentState === 'setup' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Ready to Practice?
              </h2>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 border rounded-lg">
                  <Video className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold mb-2">Facial Analysis</h3>
                  <p className="text-sm text-gray-600">
                    Track expressions and eye contact
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Mic className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-2">Voice Analysis</h3>
                  <p className="text-sm text-gray-600">
                    Monitor filler words and speaking pace
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                  <h3 className="font-semibold mb-2">Detailed Feedback</h3>
                  <p className="text-sm text-gray-600">
                    Get comprehensive performance insights
                  </p>
                </div>
              </div>
              <div className="text-center">
                <button
                  onClick={handleStartRecording}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Start Practice Interview
                </button>
              </div>
            </div>
          )}

          {currentState === 'recording' && (
            <InterviewRecorder onStop={handleStopRecording} />
          )}

          {currentState === 'analyzing' && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-2xl font-semibold mb-2">Analyzing Your Performance</h2>
              <p className="text-gray-600">Processing voice and facial data...</p>
            </div>
          )}

          {currentState === 'feedback' && analysisResults && (
            <div>
              <FeedbackDashboard results={analysisResults} />
              <div className="text-center mt-6">
                <button
                  onClick={handleNewInterview}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Practice Again
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
