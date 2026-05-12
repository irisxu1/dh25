import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

function getClient() {
  if (!GEMINI_API_KEY) {
    console.warn('REACT_APP_GEMINI_API_KEY not set');
    return null;
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

class GeminiService {
  async analyzeInterview(transcript: string, company: string, questionCount: number): Promise<any> {
    const ai = getClient();
    if (!ai) return generateMockAnalysis(transcript, company, questionCount, true);

    const prompt = `You are an expert interview coach. Analyze the following interview transcript for a ${company} interview, which had ${questionCount} questions.

Transcript:
${transcript}

For each question and answer pair, provide:
1. STAR Method Breakdown: For each of S/T/A/R, score (0-100) and specific feedback.
2. Relevance: Score (0-100) and feedback.
3. Filler Words: Count and list of filler words (um, uh, like, you know, basically, actually), plus feedback.
4. Speaking Rate: Words per minute and feedback.
5. Overall Feedback: Brief overall feedback for the answer.

Return JSON with array 'questionAnalysis', each element:
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
Also include overall metrics: total filler words, average speaking rate, overall summary, and decision (pass/fail with rationale).
All scores must be whole numbers. Return only valid JSON with no markdown.`;

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const text = result.text;
      try {
        return JSON.parse(text);
      } catch {
        console.error('Failed to parse Gemini response:', text);
        return generateMockAnalysis(transcript, company, questionCount, true);
      }
    } catch (error) {
      console.error('Gemini analysis error:', error);
      return generateMockAnalysis(transcript, company, questionCount, true);
    }
  }
}

function generateMockAnalysis(fullTranscript: string, company: string, questionCount: number, isError = false) {
  const qaPairs: { questionNumber: number; question: string; answer: string }[] = [];
  const lines = fullTranscript.split('\n').filter(line => line.trim());
  for (let i = 0; i < lines.length; i += 2) {
    if (lines[i]?.startsWith('Q') && lines[i + 1]?.startsWith('A')) {
      qaPairs.push({
        questionNumber: Math.floor(i / 2) + 1,
        question: lines[i].replace(/^Q\d+:\s*/, ''),
        answer: lines[i + 1].replace(/^A\d+:\s*/, ''),
      });
    }
  }

  const questionAnalysis = qaPairs.map(qa => {
    const fillerMatches = qa.answer.toLowerCase().match(/\b(um+|uh+|like|you know|basically|actually)\b/gi) ?? [];
    const words = qa.answer.trim().split(/\s+/).filter(Boolean);
    const wpm = Math.round(words.length / Math.max(1, words.length / 150));
    return {
      questionNumber: qa.questionNumber,
      question: qa.question,
      answer: qa.answer,
      starBreakdown: {
        situation: { score: Math.round(70 + Math.random() * 30), feedback: 'Mock feedback for situation.' },
        task: { score: Math.round(70 + Math.random() * 30), feedback: 'Mock feedback for task.' },
        action: { score: Math.round(70 + Math.random() * 30), feedback: 'Mock feedback for action.' },
        result: { score: Math.round(70 + Math.random() * 30), feedback: 'Mock feedback for result.' },
      },
      overallStarScore: Math.round(70 + Math.random() * 30),
      relevance: { score: Math.round(70 + Math.random() * 30), feedback: 'Mock feedback for relevance.' },
      fillerWords: fillerMatches.length,
      fillerWordsList: fillerMatches,
      fillerFeedback: fillerMatches.length > 3 ? 'Try to reduce filler words.' : 'Good job with filler words.',
      speakingRateWpm: wpm,
      speakingRateFeedback: wpm > 180 ? 'Try to slow down.' : wpm < 120 ? 'Try to speed up.' : 'Good pace.',
      overallFeedback: 'Mock overall feedback for this question.',
    };
  });

  const totalFillers = questionAnalysis.reduce((s, q) => s + q.fillerWords, 0);
  const avgWpm = questionAnalysis.length
    ? Math.round(questionAnalysis.reduce((s, q) => s + q.speakingRateWpm, 0) / questionAnalysis.length)
    : 0;

  return {
    metrics: { fillerWords: totalFillers, speakingRateWpm: avgWpm },
    summary: isError ? 'Gemini analysis unavailable, showing mock analysis.' : 'Mock analysis.',
    decision: { pass: !isError, rationale: isError ? 'Analysis failed.' : 'Meets baseline thresholds.' },
    questionAnalysis,
  };
}

export const geminiService = new GeminiService();
