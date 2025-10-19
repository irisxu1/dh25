import React from 'react';
import { Play, Download, Star, CheckCircle, XCircle, Sparkles, Heart, Sun, Moon, Mic } from 'lucide-react';

interface FeedbackDashboardProps {
  results: {
    transcript: string;
    recordings: Array<{
      questionNumber: number;
      question: string;
      videoUrl: string;
      videoBlob: Blob;
      size: number;
      fileName: string;
    }>;
    metrics: {
      fillerWords: number;
      speakingRateWpm: number;
    };
    questionAnalysis?: Array<{
      questionNumber: number;
      question: string;
      answer: string;
      starMethod: boolean;
      relevance: number;
      feedback: string;
      starBreakdown?: {
        situation: { score: number; feedback: string };
        task: { score: number; feedback: string };
        action: { score: number; feedback: string };
        result: { score: number; feedback: string };
      };
      relevanceFeedback?: string;
      fillerWords?: number;
      fillerWordsList?: string[];
      fillerFeedback?: string;
      overallStarScore?: number;
    }>;
    summary: string;
    decision: {
      pass: boolean;
      rationale: string;
    };
    company: string;
  };
  onRedo?: () => void;
}

const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ results, onRedo }) => {
  const { transcript, recordings, metrics, questionAnalysis, summary, decision, company } = results;

  // Parse transcript to extract Q&A pairs
  const parseTranscript = (transcript: string) => {
    const lines = transcript.split('\n').filter(line => line.trim());
    const qaPairs = [];
    
    for (let i = 0; i < lines.length; i += 2) {
      if (lines[i]?.startsWith('Q') && lines[i + 1]?.startsWith('A')) {
        const question = lines[i].replace(/^Q\d+:\s*/, '');
        const answer = lines[i + 1].replace(/^A\d+:\s*/, '');
        qaPairs.push({
          questionNumber: Math.floor(i / 2) + 1,
          question,
          answer
        });
      }
    }
    
    return qaPairs;
  };

  const qaPairs = parseTranscript(transcript);

  // Use OpenAI analysis data if available, otherwise fallback to basic analysis
  const getSTARBreakdown = (qa: any, index: number) => {
    const analysis = questionAnalysis?.[index];
    if (analysis?.starBreakdown) {
      return {
        situation: {
          present: analysis.starBreakdown.situation.score >= 70,
          feedback: analysis.starBreakdown.situation.feedback,
          score: analysis.starBreakdown.situation.score
        },
        task: {
          present: analysis.starBreakdown.task.score >= 70,
          feedback: analysis.starBreakdown.task.feedback,
          score: analysis.starBreakdown.task.score
        },
        action: {
          present: analysis.starBreakdown.action.score >= 70,
          feedback: analysis.starBreakdown.action.feedback,
          score: analysis.starBreakdown.action.score
        },
        result: {
          present: analysis.starBreakdown.result.score >= 70,
          feedback: analysis.starBreakdown.result.feedback,
          score: analysis.starBreakdown.result.score
        }
      };
    }
    
    // Fallback analysis
    const answerLower = qa.answer.toLowerCase();
    const situationKeywords = ['situation', 'context', 'when', 'where', 'background', 'circumstance'];
    const taskKeywords = ['task', 'goal', 'objective', 'responsibility', 'challenge', 'problem'];
    const actionKeywords = ['action', 'steps', 'what i did', 'approach', 'method', 'process'];
    const resultKeywords = ['result', 'outcome', 'impact', 'achievement', 'success', 'improvement'];
    
    return {
      situation: {
        present: situationKeywords.some(keyword => answerLower.includes(keyword)),
        feedback: situationKeywords.some(keyword => answerLower.includes(keyword)) 
          ? "✨ Great job setting the context!" 
          : "💡 Try starting with the situation or background",
        score: situationKeywords.some(keyword => answerLower.includes(keyword)) ? 80 : 40
      },
      task: {
        present: taskKeywords.some(keyword => answerLower.includes(keyword)),
        feedback: taskKeywords.some(keyword => answerLower.includes(keyword))
          ? "🎯 Clear task definition!" 
          : "🎯 Explain what needed to be accomplished",
        score: taskKeywords.some(keyword => answerLower.includes(keyword)) ? 80 : 40
      },
      action: {
        present: actionKeywords.some(keyword => answerLower.includes(keyword)),
        feedback: actionKeywords.some(keyword => answerLower.includes(keyword))
          ? "🚀 Excellent action steps!" 
          : "🚀 Describe the specific actions you took",
        score: actionKeywords.some(keyword => answerLower.includes(keyword)) ? 80 : 40
      },
      result: {
        present: resultKeywords.some(keyword => answerLower.includes(keyword)),
        feedback: resultKeywords.some(keyword => answerLower.includes(keyword))
          ? "🌟 Perfect results description!" 
          : "🌟 Share the outcome or impact of your actions",
        score: resultKeywords.some(keyword => answerLower.includes(keyword)) ? 80 : 40
      }
    };
  };

  // Get relevance feedback from OpenAI analysis or fallback
  const getRelevanceFeedback = (qa: any, index: number) => {
    const analysis = questionAnalysis?.[index];
    if (analysis?.relevanceFeedback) {
      return analysis.relevanceFeedback;
    }
    
    // Fallback
    const relevance = analysis?.relevance || 70;
    if (relevance >= 80) {
      return "🎉 Your answer directly addresses the question with excellent relevance!";
    } else if (relevance >= 60) {
      return "👍 Good relevance, but try to connect your answer more directly to the question.";
    } else {
      return "💭 Consider how your answer more directly relates to what was asked.";
    }
  };

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-pink-50 to-yellow-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-pink-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-pink-500" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
              Interview Analysis Results
            </h2>
          </div>
          {onRedo && (
            <button
              onClick={onRedo}
              className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Heart className="w-5 h-5" /> Practice Again
            </button>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Company: {company}</h3>
        </div>
        
        {/* Overall Decision */}
        <div className={`rounded-2xl p-6 mb-6 ${decision.pass ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200'}`}>
          <div className="flex items-center gap-3">
            {decision.pass ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-orange-600" />
            )}
            <div>
              <h3 className={`text-2xl font-bold ${decision.pass ? 'text-green-800' : 'text-orange-800'}`}>
                {decision.pass ? '🎉 Congratulations! You Passed!' : '💪 Keep Practicing!'}
              </h3>
              <p className={`text-lg mt-1 ${decision.pass ? 'text-green-700' : 'text-orange-700'}`}>
                {decision.rationale}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-6 h-6 text-pink-500" />
            <h3 className="text-xl font-semibold text-gray-800">Summary</h3>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">{summary}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-6 h-6 text-pink-500" />
              <h3 className="font-semibold text-gray-800">Voice Analysis</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Filler Words:</span>
                <span className="font-bold text-pink-600">{metrics.fillerWords}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Speaking Rate:</span>
                <span className="font-bold text-pink-600">{metrics.speakingRateWpm} WPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Recordings */}
        {recordings && recordings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-semibold text-gray-800">Your Video Recordings</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recordings.map((recording, index) => (
                <div key={index} className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-800">Question {recording.questionNumber}</span>
                    <span className="text-xs text-yellow-600">{(recording.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs text-yellow-700 font-medium">Saved as: {recording.fileName}</span>
                  </div>
                  <video 
                    controls 
                    className="w-full rounded-lg mb-3"
                    src={recording.videoUrl}
                    poster=""
                  />
                  <div className="flex gap-2">
                    <a 
                      href={recording.videoUrl} 
                      download={recording.fileName}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Again
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-Question Analysis */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-800">Question-by-Question Analysis</h3>
          </div>
          <div className="space-y-6">
            {qaPairs.map((qa, index) => {
              const starBreakdown = getSTARBreakdown(qa, index);
              const relevanceFeedback = getRelevanceFeedback(qa, index);
              
              return (
                <div key={index} className="bg-gradient-to-br from-pink-50 to-yellow-50 rounded-2xl p-6 border border-pink-200">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-bold text-lg text-pink-700">Question {qa.questionNumber}</h4>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        questionAnalysis?.[index]?.starMethod ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {questionAnalysis?.[index]?.starMethod ? 'STAR ✓' : 'STAR ✗'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        (questionAnalysis?.[index]?.relevance || 0) >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Relevance: {questionAnalysis?.[index]?.relevance || 0}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1 font-medium">Question:</p>
                    <p className="text-gray-800 bg-white rounded-lg p-3 border border-pink-100">{qa.question}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1 font-medium">Your Answer:</p>
                    <p className="text-gray-800 bg-white rounded-lg p-3 border border-pink-100">{qa.answer}</p>
                  </div>
                  
                  {/* STAR Method Checklist */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      STAR Method Checklist
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(starBreakdown).map(([letter, data]) => (
                        <div key={letter} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-pink-100">
                          <div className="flex-shrink-0">
                            {data.present ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <XCircle className="w-6 h-6 text-orange-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-bold text-gray-800 capitalize">{letter}</p>
                              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                data.score >= 80 ? 'bg-green-100 text-green-800' :
                                data.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {data.score}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{data.feedback}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Filler Words Analysis */}
                  {questionAnalysis?.[index]?.fillerWords !== undefined && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 mb-4">
                      <h5 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                        <Mic className="w-5 h-5 text-purple-500" />
                        Filler Words Analysis
                      </h5>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-lg font-bold text-purple-700">
                          {questionAnalysis[index].fillerWords || 0} filler words
                        </span>
                        {questionAnalysis[index].fillerWordsList && questionAnalysis[index].fillerWordsList!.length > 0 && (
                          <span className="text-sm text-purple-600">
                            Found: {questionAnalysis[index].fillerWordsList!.join(', ')}
                          </span>
                        )}
                      </div>
                      <p className="text-purple-700 text-sm">{questionAnalysis[index].fillerFeedback || 'No specific feedback available.'}</p>
                    </div>
                  )}

                  {/* Relevance Feedback */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Moon className="w-5 h-5 text-blue-500" />
                      Relevance Analysis
                    </h5>
                    <p className="text-blue-700">{relevanceFeedback}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Transcript */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <h3 className="text-xl font-semibold text-gray-800">Complete Transcript</h3>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-yellow-50 rounded-2xl p-6 border border-pink-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{transcript}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDashboard;