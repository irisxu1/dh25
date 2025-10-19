const express = require('express');
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
});

// Analyze interview transcript using Gemini
router.post('/analyze-interview', async (req, res) => {
  try {
    const { transcript, company, questionCount } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // Parse transcript to extract Q&A pairs
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

    if (qaPairs.length === 0) {
      return res.status(400).json({ error: 'No valid Q&A pairs found in transcript' });
    }

    // Create detailed prompt for Gemini
    const prompt = `
You are an expert interview coach analyzing a ${company} interview. Please provide detailed feedback on the following interview responses.

Company: ${company}
Total Questions: ${qaPairs.length}

Interview Transcript:
${transcript}

For each question and answer pair, please provide the following analysis in JSON format:

{
  "questionAnalysis": [
    {
      "questionNumber": 1,
      "question": "Question text",
      "answer": "Answer text",
      "starBreakdown": {
        "situation": {
          "score": 85,
          "feedback": "Specific feedback about situation context"
        },
        "task": {
          "score": 90,
          "feedback": "Specific feedback about task description"
        },
        "action": {
          "score": 80,
          "feedback": "Specific feedback about actions taken"
        },
        "result": {
          "score": 75,
          "feedback": "Specific feedback about results achieved"
        }
      },
      "overallStarScore": 82,
      "starMethod": true,
      "relevance": {
        "score": 88,
        "feedback": "How well the answer addresses the specific question asked"
      },
      "fillerWords": 3,
      "fillerWordsList": ["um", "uh", "like"],
      "fillerFeedback": "Good job minimizing filler words",
      "speakingRateWpm": 145,
      "speakingRateFeedback": "Good speaking pace",
      "overallFeedback": "Comprehensive feedback on the entire response"
    }
  ],
  "metrics": {
    "fillerWords": 12,
    "speakingRateWpm": 142
  },
  "summary": "Overall interview performance summary with key strengths and areas for improvement",
  "decision": {
    "pass": true,
    "rationale": "Detailed explanation of why the candidate passed or needs improvement"
  }
}

Guidelines:
1. Score each STAR element (Situation, Task, Action, Result) from 0-100
2. Calculate overall STAR score as average of the four elements
3. Mark starMethod as true if overall STAR score >= 70
4. Score relevance from 0-100 based on how well the answer addresses the question
5. Count filler words like "um", "uh", "like", "you know", "basically", "actually"
6. Estimate speaking rate in words per minute (WPM) - good range is 120-180 WPM
7. Provide specific, actionable feedback for each element
8. Make the decision based on overall performance across all questions
9. Ensure all scores are whole numbers (no decimals)

Please respond with ONLY the JSON object, no additional text or formatting.
`;

    console.log('Sending request to Gemini API...');
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    console.log('Gemini response received');
    const responseText = response.text;
    console.log('Response text length:', responseText.length);

    // Try to parse the JSON response
    let analysisResult;
    try {
      // Clean up the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.log('Raw response:', responseText);
      
      // Fallback to mock analysis if parsing fails
      analysisResult = generateMockAnalysis(qaPairs, transcript, true);
    }

    // Ensure all scores are whole numbers
    if (analysisResult.questionAnalysis) {
      analysisResult.questionAnalysis.forEach(qa => {
        if (qa.starBreakdown) {
          Object.values(qa.starBreakdown).forEach(element => {
            if (element.score) {
              element.score = Math.round(element.score);
            }
          });
        }
        if (qa.overallStarScore) {
          qa.overallStarScore = Math.round(qa.overallStarScore);
        }
        if (qa.relevance && qa.relevance.score) {
          qa.relevance.score = Math.round(qa.relevance.score);
        }
        if (qa.speakingRateWpm) {
          qa.speakingRateWpm = Math.round(qa.speakingRateWpm);
        }
      });
    }

    if (analysisResult.metrics) {
      if (analysisResult.metrics.speakingRateWpm) {
        analysisResult.metrics.speakingRateWpm = Math.round(analysisResult.metrics.speakingRateWpm);
      }
    }

    res.json(analysisResult);

  } catch (error) {
    console.error('Gemini analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze interview with Gemini',
      details: error.message
    });
  }
});

// Fallback mock analysis function
function generateMockAnalysis(qaPairs, transcript, isError = false) {
  const mockAnalysis = {
    metrics: {
      fillerWords: 0,
      speakingRateWpm: 150,
    },
    summary: isError ? 'Gemini analysis failed, providing fallback mock analysis.' : 'Mock analysis (connect Gemini API for real insights).',
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
          situation: { score: Math.round(70 + Math.random() * 30), feedback: "Mock feedback for situation." },
          task: { score: Math.round(70 + Math.random() * 30), feedback: "Mock feedback for task." },
          action: { score: Math.round(70 + Math.random() * 30), feedback: "Mock feedback for action." },
          result: { score: Math.round(70 + Math.random() * 30), feedback: "Mock feedback for result." }
        },
        overallStarScore: Math.round(70 + Math.random() * 30),
        starMethod: Math.random() > 0.3,
        relevance: { score: Math.round(70 + Math.random() * 30), feedback: "Mock feedback for relevance." },
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
