import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Helper to execute Gemini requests with retries and backoff using gemini-3.6-flash
  async function callGeminiWithRetry(requestOptions: any, maxRetries = 3) {
    const modelName = 'gemini-3.6-flash';
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...requestOptions,
          model: modelName,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errStr = (err?.message || '') + ' ' + JSON.stringify(err);
        const isQuota =
          err?.status === 429 ||
          errStr.includes('429') ||
          errStr.includes('RESOURCE_EXHAUSTED') ||
          errStr.includes('quota');

        if (isQuota && attempt < maxRetries) {
          const delayMs = (attempt + 1) * 2000;
          console.warn(`[Gemini API] 429 rate limit hit on ${modelName}, retrying attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        throw err;
      }
    }

    throw lastError;
  }

  function formatGeminiError(err: any): string {
    let msg = err?.message || String(err);

    if (typeof msg === 'string' && msg.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(msg);
        if (parsed.error?.message) {
          msg = parsed.error.message;
        }
      } catch {
        // ignore
      }
    }

    const errContext = (JSON.stringify(err) + ' ' + msg).toLowerCase();

    if (errContext.includes('429') || errContext.includes('resource_exhausted') || errContext.includes('quota')) {
      return 'Gemini API rate limit reached (429). The free tier request limit was temporarily exceeded. Please wait ~15-30 seconds and try again, or select an existing pre-loaded question bank.';
    }

    return msg || 'Failed to communicate with Gemini AI.';
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Step 1: Generate Role Question Pool
  app.post('/api/question-bank/generate', async (req, res) => {
    try {
      const { roleName, experienceLevel, customFocus, questionCount } = req.body;
      if (!roleName || !experienceLevel) {
        return res.status(400).json({ error: 'roleName and experienceLevel are required' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured.' });
      }

      // Generate a comprehensive 20-question pool for any role
      const prompt = `You are an expert HR Technical Director & Principal Engineer designing a comprehensive technical interview question bank for the role of "${roleName}" at the "${experienceLevel}" experience level.
${customFocus ? `Special focus area: ${customFocus}` : ''}

Generate EXACTLY 20 distinct, high-quality interview questions categorized as follows:
- 5 'basic' questions (fundamentals, core concepts - mix of easy, medium, hard)
- 7 'domain' questions (deep role-specific tech stack, architecture - mix of easy, medium, hard)
- 4 'trends' questions (modern tools, industry shifts - mix of medium, hard)
- 4 'situational' questions (real-world scenarios, debugging, tradeoffs - mix of easy, medium, hard)

For each question, provide 3 to 5 clear, objective key evaluation criteria points that candidate answers should be scored against.`;

      const response = await callGeminiWithRetry({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              roleName: { type: Type.STRING },
              experienceLevel: { type: Type.STRING },
              description: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      description: "Must be one of: 'basic', 'domain', 'trends', 'situational'",
                    },
                    difficulty: {
                      type: Type.STRING,
                      description: "Must be one of: 'easy', 'medium', 'hard'",
                    },
                    questionText: { type: Type.STRING },
                    keyEvaluationCriteria: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    sampleGoodAnswerSummary: { type: Type.STRING },
                  },
                  required: ['id', 'category', 'difficulty', 'questionText', 'keyEvaluationCriteria'],
                },
              },
            },
            required: ['roleName', 'experienceLevel', 'description', 'questions'],
          },
        },
      });

      const jsonText = response.text || '{}';
      const parsed = JSON.parse(jsonText);

      // Add server-side timestamp and unique ID
      const pool = {
        id: `pool-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        roleName: parsed.roleName || roleName,
        experienceLevel: parsed.experienceLevel || experienceLevel,
        createdAt: new Date().toISOString(),
        description: parsed.description || `Question pool generated for ${experienceLevel} ${roleName}`,
        questions: (parsed.questions || []).map((q: any, index: number) => ({
          ...q,
          id: q.id || `q-${index + 1}-${Date.now()}`,
          category: ['basic', 'domain', 'trends', 'situational'].includes(q.category) ? q.category : 'domain',
          difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
        })),
      };

      res.json(pool);
    } catch (err: any) {
      console.error('Error generating question pool:', err);
      res.status(500).json({ error: formatGeminiError(err) });
    }
  });

  // Step 3: Evaluate Candidate Answer
  app.post('/api/interview/evaluate-answer', async (req, res) => {
    try {
      const { question, candidateAnswer, roleName, experienceLevel } = req.body;
      if (!question || candidateAnswer === undefined) {
        return res.status(400).json({ error: 'question and candidateAnswer are required' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured.' });
      }

      const prompt = `You are a strict technical interviewer evaluating a candidate applying for a ${experienceLevel || ''} ${roleName || 'Technical'} role.

QUESTION:
Category: ${question.category}
Difficulty: ${question.difficulty}
Text: "${question.questionText}"

KEY EVALUATION CRITERIA:
${(question.keyEvaluationCriteria || []).map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

CANDIDATE'S SUBMITTED ANSWER:
"${candidateAnswer}"

CRITICAL SCORING MANDATE:
- ZERO / LOW SCORE (0 - 10): If candidate answer is nonsensical, off-topic (e.g. "by eating snacks", "eating food", random joke/troll text, "idk"), blank, or completely lacking technical relevance. You MUST assign score 0 to 10. Do NOT give polite default points.
- PARTIAL SCORE (35 - 65): If answer is partially correct or misses several key criteria.
- FULL SCORE (85 - 100): If answer accurately explains the concept and satisfies key evaluation criteria.

Determine suggested difficulty shift:
- If overall score >= 75: return 'harder'
- If overall score < 45: return 'easier'
- Otherwise: return 'same'`;

      const response = await callGeminiWithRetry({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: 'Overall answer score 0 to 100' },
              technicalAccuracy: { type: Type.NUMBER, description: '0 to 100' },
              completeness: { type: Type.NUMBER, description: '0 to 100' },
              clarity: { type: Type.NUMBER, description: '0 to 100' },
              keyPointsCovered: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingOrInaccuratePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              constructiveFeedback: { type: Type.STRING },
              suggestedDifficultyShift: {
                type: Type.STRING,
                description: "Must be 'harder', 'easier', or 'same'",
              },
            },
            required: [
              'score',
              'technicalAccuracy',
              'completeness',
              'clarity',
              'keyPointsCovered',
              'missingOrInaccuratePoints',
              'constructiveFeedback',
              'suggestedDifficultyShift',
            ],
          },
        },
      });

      const jsonText = response.text || '{}';
      const parsed = JSON.parse(jsonText);

      res.json({
        score: Math.min(100, Math.max(0, Math.round(parsed.score || 0))),
        technicalAccuracy: Math.min(100, Math.max(0, Math.round(parsed.technicalAccuracy || 0))),
        completeness: Math.min(100, Math.max(0, Math.round(parsed.completeness || 0))),
        clarity: Math.min(100, Math.max(0, Math.round(parsed.clarity || 0))),
        keyPointsCovered: parsed.keyPointsCovered || [],
        missingOrInaccuratePoints: parsed.missingOrInaccuratePoints || [],
        constructiveFeedback: parsed.constructiveFeedback || 'No feedback provided',
        suggestedDifficultyShift: ['harder', 'easier', 'same'].includes(parsed.suggestedDifficultyShift)
          ? parsed.suggestedDifficultyShift
          : 'same',
      });
    } catch (err: any) {
      console.error('Error evaluating answer:', err);
      res.status(500).json({ error: formatGeminiError(err) });
    }
  });

  // Step 4: Generate Final Interview Report
  app.post('/api/interview/generate-report', async (req, res) => {
    try {
      const { candidateName, candidateEmail, roleName, experienceLevel, questionSessions } = req.body;
      if (!candidateName || !roleName || !questionSessions) {
        return res.status(400).json({ error: 'candidateName, roleName, and questionSessions are required' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured.' });
      }

      const sessionsSummary = questionSessions.map((s: any, idx: number) => {
        return `[Question ${idx + 1}] (${s.question?.category} - ${s.question?.difficulty})
Q: "${s.question?.questionText}"
A: "${s.candidateAnswer}"
Time Spent: ${s.timeSpentSeconds || 0} seconds
Score: ${s.evaluation?.score ?? 'N/A'}/100
Feedback: "${s.evaluation?.constructiveFeedback || ''}"
Missing: ${(s.evaluation?.missingOrInaccuratePoints || []).join('; ')}`;
      }).join('\n\n');

      const prompt = `You are a Chief Talent Officer and Senior Technical Hiring Manager reviewing the complete automated ${questionSessions.length}-question AI interview session for candidate "${candidateName}" applying for "${experienceLevel}" "${roleName}".

INTERVIEW SESSION TRANSCRIPT & SCORES:
${sessionsSummary}

Generate a sharp, actionable candidate assessment report with the following fields:
1. overallScore: (0-100 calculated average)
2. recommendation: ('Strong Hire', 'Hire', 'Borderline', 'No Hire')
3. summary: A short, point-wise executive summary formatted as bullet points (using "• " prefix for each line):
   • Technical Alignment: Sharp evaluation of role-specific tech depth and domain knowledge.
   • Answer Style & Intent: Did candidate provide direct/concise answers vs adding unnecessary stories/fluff?
   • Response Pace & Speed: Evaluation of answer duration and deliberation pace across questions.
   • Vocabulary & Grammar: Notice spelling/grammar quality and tone (e.g. plain technical clarity vs overly formal/flowery vocabulary).
4. strengths: 3 to 4 SHORT and CRISP single-sentence bullet points (maximum 12-15 words each).
5. weaknesses: 3 to 4 SHORT and CRISP single-sentence bullet points (maximum 12-15 words each).
6. followUpQuestionsForInterviewer: 3 to 4 concise probing questions for the human face-to-face round.`;

      const response = await callGeminiWithRetry({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.NUMBER },
              recommendation: {
                type: Type.STRING,
                description: "Must be 'Strong Hire', 'Hire', 'Borderline', or 'No Hire'",
              },
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              followUpQuestionsForInterviewer: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['overallScore', 'recommendation', 'summary', 'strengths', 'weaknesses', 'followUpQuestionsForInterviewer'],
          },
        },
      });

      const jsonText = response.text || '{}';
      const parsed = JSON.parse(jsonText);

      // Compute exact category breakdown statistics locally
      const categories = ['basic', 'domain', 'trends', 'situational'] as const;
      const categoryBreakdown = categories.map((cat) => {
        const catSessions = questionSessions.filter((s: any) => s.question?.category === cat);
        const totalScore = catSessions.reduce((acc: number, s: any) => acc + (s.evaluation?.score || 0), 0);
        const avgScore = catSessions.length > 0 ? Math.round(totalScore / catSessions.length) : 0;
        
        return {
          category: cat,
          categoryName: cat === 'basic' ? 'Basic Fundamentals' : cat === 'domain' ? 'Domain Specific' : cat === 'trends' ? 'Recent Trends' : 'Situational / Scenarios',
          score: avgScore,
          questionsAnswered: catSessions.length,
          easyCount: catSessions.filter((s: any) => s.question?.difficulty === 'easy').length,
          mediumCount: catSessions.filter((s: any) => s.question?.difficulty === 'medium').length,
          hardCount: catSessions.filter((s: any) => s.question?.difficulty === 'hard').length,
        };
      });

      const totalTimeSpentSeconds = questionSessions.reduce((acc: number, s: any) => acc + (s.timeSpentSeconds || 0), 0);

      const report = {
        id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        candidateName,
        candidateEmail: candidateEmail || '',
        roleName,
        experienceLevel,
        completedAt: new Date().toISOString(),
        totalTimeSpentSeconds,
        overallScore: Math.min(100, Math.max(0, Math.round(parsed.overallScore || 0))),
        recommendation: ['Strong Hire', 'Hire', 'Borderline', 'No Hire'].includes(parsed.recommendation)
          ? parsed.recommendation
          : 'Borderline',
        summary: parsed.summary || 'Summary unavailable',
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        categoryBreakdown,
        followUpQuestionsForInterviewer: parsed.followUpQuestionsForInterviewer || [],
        questionSessions,
      };

      res.json(report);
    } catch (err: any) {
      console.error('Error generating report:', err);
      res.status(500).json({ error: err.message || 'Failed to generate interview report' });
    }
  });

  // Vite development middleware vs Static Production files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
