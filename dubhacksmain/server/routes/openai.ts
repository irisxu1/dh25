import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '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';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Analyze transcript endpoint with OpenAI
router.post('/analyze', async (req, res) => {
  try {
    const { transcript, qaPairs, meta } = req.body;

    if (!transcript || !qaPairs || qaPairs.length === 0) {
      return res.status(400).json({ error: 'Transcript and Q&A pairs are required' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Analyze each Q&A pair with OpenAI
    const questionAnalysis = [];
    
    for (const qa of qaPairs) {
      try {
        // Analyze STAR method
        const starPrompt = `Analyze this interview answer for the STAR method (Situation, Task, Action, Result). 

Question: "${qa.question}"
Answer: "${qa.answer}"

Please provide:
1. A score (0-100) for each STAR component (Situation, Task, Action, Result)
2. Specific feedback for each component
3. Overall STAR method score (0-100)
4. Relevance score (0-100) - how well the answer addresses the question
5. Relevance feedback

Respond in JSON format:
{
  "starBreakdown": {
    "situation": {"score": 85, "feedback": "Good context setting"},
    "task": {"score": 90, "feedback": "Clear objective stated"},
    "action": {"score": 75, "feedback": "Actions described but could be more specific"},
    "result": {"score": 80, "feedback": "Results mentioned with some metrics"}
  },
  "overallStarScore": 82,
  "relevance": {"score": 88, "feedback": "Answer directly addresses the question with good examples"}
}`;

        const starResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: starPrompt }],
          temperature: 0.3,
        });

        const starAnalysis = JSON.parse(starResponse.choices[0].message.content || '{}');

        // Analyze filler words
        const fillerPrompt = `Count filler words in this text and provide analysis:

"${qa.answer}"

Count words like: um, uh, like, you know, basically, actually, so, well, I mean, kind of, sort of

Respond in JSON format:
{
  "fillerWords": 5,
  "fillerWordsList": ["um", "like", "you know"],
  "feedback": "Good job minimizing filler words! Consider pausing instead of using 'um' or 'uh'."
}`;

        const fillerResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: fillerPrompt }],
          temperature: 0.3,
        });

        const fillerAnalysis = JSON.parse(fillerResponse.choices[0].message.content || '{}');

        questionAnalysis.push({
          questionNumber: qa.questionNumber,
          question: qa.question,
          answer: qa.answer,
          starMethod: starAnalysis.overallStarScore >= 70,
          starBreakdown: starAnalysis.starBreakdown,
          relevance: starAnalysis.relevance.score,
          relevanceFeedback: starAnalysis.relevance.feedback,
          fillerWords: fillerAnalysis.fillerWords || 0,
          fillerWordsList: fillerAnalysis.fillerWordsList || [],
          fillerFeedback: fillerAnalysis.feedback || '',
          overallStarScore: starAnalysis.overallStarScore || 0
        });

      } catch (error) {
        console.error(`Error analyzing question ${qa.questionNumber}:`, error);
        // Fallback analysis
        questionAnalysis.push({
          questionNumber: qa.questionNumber,
          question: qa.question,
          answer: qa.answer,
          starMethod: false,
          starBreakdown: {
            situation: { score: 50, feedback: "Analysis failed - please try again" },
            task: { score: 50, feedback: "Analysis failed - please try again" },
            action: { score: 50, feedback: "Analysis failed - please try again" },
            result: { score: 50, feedback: "Analysis failed - please try again" }
          },
          relevance: 50,
          relevanceFeedback: "Analysis failed - please try again",
          fillerWords: 0,
          fillerWordsList: [],
          fillerFeedback: "Analysis failed - please try again",
          overallStarScore: 50
        });
      }
    }

    // Calculate overall metrics
    const totalFillerWords = questionAnalysis.reduce((sum, qa) => sum + qa.fillerWords, 0);
    const avgRelevance = questionAnalysis.reduce((sum, qa) => sum + qa.relevance, 0) / questionAnalysis.length;
    const avgStarScore = questionAnalysis.reduce((sum, qa) => sum + qa.overallStarScore, 0) / questionAnalysis.length;
    
    // Estimate speaking rate (rough calculation)
    const totalWords = transcript.split(' ').length;
    const estimatedMinutes = Math.max(1, totalWords / 150); // Rough estimate
    const speakingRateWpm = Math.round(totalWords / estimatedMinutes);

    const pass = avgStarScore >= 60 && avgRelevance >= 60 && totalFillerWords <= 15;

    res.json({
      summary: `AI-powered analysis completed! Average STAR score: ${Math.round(avgStarScore)}%, Average relevance: ${Math.round(avgRelevance)}%, Total filler words: ${totalFillerWords}`,
      metrics: {
        fillerWords: totalFillerWords,
        speakingRateWpm: speakingRateWpm
      },
      questionAnalysis,
      decision: {
        pass,
        rationale: pass 
          ? 'Excellent performance! You demonstrated good structure, relevance, and communication skills.'
          : 'Good effort! Focus on improving STAR method structure, relevance, or reducing filler words.'
      }
    });

  } catch (error) {
    console.error('OpenAI analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze transcript',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as openaiRoutes };
