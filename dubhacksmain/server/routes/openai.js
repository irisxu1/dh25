const express = require('express');
const OpenAI = require('openai');

const router = express.Router();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

router.post('/analyze', async (req, res) => {
  const { transcript, qaPairs, meta } = req.body;

  if (!openai) {
    console.warn('OpenAI API key not configured, returning mock analysis.');
    return res.status(200).json(generateMockAnalysis(qaPairs, transcript));
  }

  try {
    const prompt = `You are an interview coach AI. Analyze the following interview transcript.
    The candidate is interviewing for a role at ${meta.company}.
    
    Transcript:
    ${transcript}

    For each question and answer pair, provide the following:
    1. **STAR Method Breakdown**: For each of S, T, A, R, give a score (0-100) and specific feedback.
    2. **Relevance**: A score (0-100) and feedback on how relevant the answer was to the question.
    3. **Filler Words**: Count of filler words (um, uh, like, you know, basically, actually) and a list of them, plus feedback.
    4. **Speaking Rate**: Words per minute (WPM) and feedback.
    5. **Overall Feedback**: A brief overall feedback for the answer.

    Return the analysis as a JSON object with an array 'questionAnalysis', where each element corresponds to a question and contains:
    {
      questionNumber: number,
      question: string,
      answer: string,
      starBreakdown: {
        situation: { score: number, feedback: string },
        task: { score: number, feedback: string },
        action: { score: number, feedback: string },
        result: { score: number, feedback: string }
      },
      overallStarScore: number,
      relevance: { score: number, feedback: string },
      fillerWords: number,
      fillerWordsList: string[],
      fillerFeedback: string,
      speakingRateWpm: number,
      speakingRateFeedback: string,
      overallFeedback: string
    }
    Also provide overall metrics: total filler words, average speaking rate, and an overall summary and decision (pass/fail with rationale).
    `;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o", // Using a capable model for detailed analysis
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const analysisResult = JSON.parse(chatCompletion.choices[0].message.content || '{}');
    res.json(analysisResult);

  } catch (error) {
    console.error('OpenAI analysis error:', error.response?.data || error.message);
    res.status(500).json(generateMockAnalysis(qaPairs, transcript, true)); // Fallback to mock on error
  }
});

function generateMockAnalysis(qaPairs, transcript, isError = false) {
  const mockAnalysis = {
    metrics: {
      fillerWords: 0,
      speakingRateWpm: 150,
    },
    summary: isError ? 'OpenAI analysis failed, providing fallback mock analysis.' : 'Mock analysis (connect OpenAI API for real insights).',
    decision: { pass: !isError, rationale: isError ? 'Analysis failed.' : 'Meets baseline thresholds.' },
    questionAnalysis: qaPairs.map((qa, index) => {
      const answerLower = qa.answer.toLowerCase();
      const fillerMatches = answerLower.match(/\b(um+|uh+|like|you know|basically|actually)\b/gi) ?? [];
      const words = qa.answer.trim().split(/\s+/).filter(Boolean);
      const duration = words.length / 150; // Assume 150 WPM for mock duration
      const speakingRateWpm = Math.round(words.length / Math.max(1, duration));

      return {
        questionNumber: qa.questionNumber,
        question: qa.question,
        answer: qa.answer,
        starBreakdown: {
          situation: { score: 70 + Math.random() * 30, feedback: "Mock feedback for situation." },
          task: { score: 70 + Math.random() * 30, feedback: "Mock feedback for task." },
          action: { score: 70 + Math.random() * 30, feedback: "Mock feedback for action." },
          result: { score: 70 + Math.random() * 30, feedback: "Mock feedback for result." }
        },
        overallStarScore: Math.round(70 + Math.random() * 30),
        relevance: { score: 70 + Math.random() * 30, feedback: "Mock feedback for relevance." },
        fillerWords: fillerMatches.length,
        fillerWordsList: fillerMatches,
        fillerFeedback: fillerMatches.length > 3 ? "Try to reduce filler words." : "Good job with filler words.",
        speakingRateWpm: speakingRateWpm,
        speakingRateFeedback: speakingRateWpm > 180 ? "Try to slow down." : speakingRateWpm < 120 ? "Try to speed up." : "Good pace.",
        overallFeedback: "Mock overall feedback for this question."
      };
    })
  };

  mockAnalysis.metrics.fillerWords = mockAnalysis.questionAnalysis.reduce((sum, qa) => sum + qa.fillerWords, 0);
  mockAnalysis.metrics.speakingRateWpm = Math.round(mockAnalysis.questionAnalysis.reduce((sum, qa) => sum + qa.speakingRateWpm, 0) / mockAnalysis.questionAnalysis.length);

  return mockAnalysis;
}

module.exports = { router };
