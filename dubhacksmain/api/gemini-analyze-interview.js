const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is required');
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fullTranscript, company, questionCount } = req.body;

    if (!fullTranscript || !company || questionCount === undefined) {
      return res.status(400).json({ error: 'Missing required parameters: fullTranscript, company, questionCount' });
    }

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert interview coach. Analyze the following interview transcript for a ${company} interview, which had ${questionCount} questions.

    Transcript:
    ${fullTranscript}

    For each question and answer pair, provide the following:
    1. **STAR Method Breakdown**: For each of S (Situation), T (Task), A (Action), R (Result), give a score (0-100) and specific feedback.
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
    Ensure all scores are whole numbers.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse the text as JSON
    let analysisResult;
    try {
      analysisResult = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Raw Gemini response:', text);
      // Fallback to mock analysis if parsing fails
      return res.status(500).json(generateMockAnalysis(fullTranscript, company, questionCount, true));
    }

    res.json(analysisResult);

  } catch (error) {
    console.error('Gemini analysis error:', error.response?.data || error.message);
    res.status(500).json(generateMockAnalysis(fullTranscript, company, questionCount, true)); // Fallback to mock on error
  }
};

function generateMockAnalysis(fullTranscript, company, questionCount, isError = false) {
  // This is a simplified mock. In a real scenario, you'd parse fullTranscript
  // to extract Q&A pairs and generate more realistic mock data.
  const qaPairs = [];
  const lines = fullTranscript.split('\n').filter(line => line.trim());
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

  const mockAnalysis = {
    metrics: {
      fillerWords: isError ? 0 : Math.round(Math.random() * 10),
      speakingRateWpm: isError ? 0 : Math.round(120 + Math.random() * 60), // 120-180 WPM
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
