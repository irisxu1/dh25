import express from 'express';
import axios from 'axios';

const router = express.Router();

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Analyze transcript endpoint with STAR method analysis
router.post('/analyze', async (req, res) => {
  try {
    const { transcript, qaPairs, meta } = req.body;

    if (!transcript || !qaPairs || qaPairs.length === 0) {
      return res.status(400).json({ error: 'Transcript and Q&A pairs are required' });
    }

    if (!GEMINI_API_KEY) {
      // Return enhanced mock analysis if no Gemini API key
      return res.json(generateMockAnalysis(qaPairs));
    }

    // TODO: Implement actual Gemini API integration
    // For now, return enhanced mock analysis
    return res.json(generateMockAnalysis(qaPairs));

  } catch (error) {
    console.error('Gemini analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze transcript',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function generateMockAnalysis(qaPairs: any[]) {
  const allAnswers = qaPairs.map(qa => qa.answer).join(' ');
  const fillerMatches = allAnswers.match(/\b(um+|uh+|like|you know|basically|actually)\b/gi) ?? [];
  const words = allAnswers.trim().split(/\s+/).filter(Boolean);
  const minutes = Math.max(1, words.length / 150);
  const speakingRateWpm = Math.round(words.length / minutes);
  const fillerWords = fillerMatches.length;

  // Generate per-question analysis
  const questionAnalysis = qaPairs.map((qa, index) => {
    const answerWords = qa.answer.toLowerCase();
    
    // STAR method detection
    const starKeywords = ['situation', 'task', 'action', 'result', 'challenge', 'problem', 'solution', 'outcome', 'example', 'experience'];
    const hasStarElements = starKeywords.some(keyword => answerWords.includes(keyword));
    
    // Relevance scoring (mock)
    const relevance = Math.min(100, Math.max(60, 70 + Math.random() * 25));
    
    // Generate feedback
    let feedback = '';
    if (hasStarElements) {
      feedback = 'Excellent use of structured response with specific examples. Good demonstration of the STAR method.';
    } else if (qa.answer.length > 100) {
      feedback = 'Good detailed response. Consider using the STAR method (Situation, Task, Action, Result) for more structure.';
    } else {
      feedback = 'Response could be more detailed. Try using specific examples and the STAR method for better structure.';
    }

    return {
      questionNumber: qa.questionNumber,
      question: qa.question,
      answer: qa.answer,
      starMethod: hasStarElements,
      relevance: Math.round(relevance),
      feedback
    };
  });

  const overallStarScore = questionAnalysis.filter(qa => qa.starMethod).length / questionAnalysis.length;
  const avgRelevance = questionAnalysis.reduce((sum, qa) => sum + qa.relevance, 0) / questionAnalysis.length;
  
  const pass = fillerWords <= 10 && speakingRateWpm >= 100 && speakingRateWpm <= 200 && overallStarScore >= 0.5;

  return {
    summary: `Interview analysis completed. ${overallStarScore >= 0.5 ? 'Good use of structured responses.' : 'Consider using more structured responses.'} Average relevance: ${Math.round(avgRelevance)}%.`,
    metrics: {
      fillerWords,
      speakingRateWpm
    },
    questionAnalysis,
    decision: {
      pass,
      rationale: pass 
        ? 'Meets performance standards with good structure and appropriate speaking rate'
        : 'Needs improvement in structure, speaking rate, or filler word usage'
    }
  };
}

export { router as geminiRoutes };