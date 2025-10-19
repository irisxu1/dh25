export type AnalysisRequestMeta = {
  company: string;
  questionCount: number;
};

function extractAnswerText(transcript: string): string {
  const lines = transcript.split(/\n+/).map(s => s.trim());
  const answers = lines
    .filter(l => /^A\d+:\s*/i.test(l))
    .map(l => l.replace(/^A\d+:\s*/i, ''))
    .filter(t => t && t !== '[transcription unavailable]' && t !== '[Transcription failed]');
  return answers.join(' ');
}

function parseQAPairs(transcript: string) {
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
}

export async function analyzeTranscriptWithGemini(transcript: string, meta: AnalysisRequestMeta): Promise<any> {
  const answersText = extractAnswerText(transcript);
  const hasAnswers = answersText.trim().length > 0;
  const qaPairs = parseQAPairs(transcript);

  // Try backend OpenAI API first
  if (hasAnswers && qaPairs.length > 0) {
    try {
      const res = await fetch('http://localhost:3001/api/openai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript, 
          qaPairs,
          meta 
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.warn('OpenAI API failed, using fallback:', error);
    }
  }

  if (!hasAnswers) {
    return {
      summary: 'We could not detect clear spoken answers from the transcript. Please ensure your mic permissions are granted and try again.',
      metrics: {
        fillerWords: 0,
        speakingRateWpm: 0
      },
      questionAnalysis: [],
      decision: { pass: false, rationale: 'Insufficient transcript to evaluate.' }
    };
  }

  // Fallback analysis
  const fillerMatches = answersText.match(/\b(um+|uh+|like|you know|basically|actually)\b/gi) ?? [];
  const words = answersText.trim().split(/\s+/).filter(Boolean);
  const minutes = Math.max(1, words.length / 150);
  const speakingRateWpm = Math.round(words.length / minutes);
  const fillerWords = fillerMatches.length;

  // Basic STAR method detection
  const starKeywords = ['situation', 'task', 'action', 'result', 'challenge', 'problem', 'solution', 'outcome'];
  const hasStarElements = starKeywords.some(keyword => 
    answersText.toLowerCase().includes(keyword)
  );

  // Generate per-question analysis
  const questionAnalysis = qaPairs.map((qa, index) => {
    const answerWords = qa.answer.toLowerCase();
    const hasStar = starKeywords.some(keyword => answerWords.includes(keyword));
    const relevance = Math.min(100, Math.max(0, 60 + Math.random() * 30)); // Placeholder
    
    return {
      questionNumber: qa.questionNumber,
      question: qa.question,
      answer: qa.answer,
      starMethod: hasStar,
      relevance: Math.round(relevance),
      feedback: hasStar 
        ? 'Good use of structured response with specific examples'
        : 'Consider using the STAR method (Situation, Task, Action, Result) for more structured answers'
    };
  });

  const pass = fillerWords <= 10 && speakingRateWpm >= 100 && speakingRateWpm <= 200;

  return {
    summary: 'Analysis completed using fallback method. Connect Gemini API for more detailed insights.',
    metrics: { 
      fillerWords, 
      speakingRateWpm
    },
    questionAnalysis,
    decision: { 
      pass, 
      rationale: pass 
        ? 'Meets baseline performance standards' 
        : 'Falls below one or more thresholds (filler words, speaking rate)' 
    }
  };
}