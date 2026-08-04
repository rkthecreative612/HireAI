import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

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
      return 'AI rate limit reached (429). The free tier request limit was temporarily exceeded. Please wait ~15-30 seconds and try again, or select an existing pre-loaded question bank.';
    }

    return msg || 'Failed to communicate with AI engine.';
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Step 1: Generate Role Question Pool
  app.post('/api/question-bank/generate', async (req, res) => {
    try {
      const { roleName, experienceLevel, customFocus, questionCount, assessmentType } = req.body;
      if (!roleName || !experienceLevel) {
        return res.status(400).json({ error: 'roleName and experienceLevel are required' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured.' });
      }

      const requestedCount = Number(questionCount);
      const count = requestedCount === 50 ? 50 : requestedCount === 100 ? 100 : 20;

      let basicCount = 5;
      let domainCount = 7;
      let trendsCount = 4;
      let situationalCount = 4;

      if (count === 50) {
        basicCount = 12;
        domainCount = 18;
        trendsCount = 10;
        situationalCount = 10;
      } else if (count === 100) {
        basicCount = 25;
        domainCount = 35;
        trendsCount = 20;
        situationalCount = 20;
      }

      const isMcq = assessmentType === 'mcq';

      let prompt = '';
      let responseSchema: any = null;

      if (isMcq) {
        prompt = `You are an expert HR Technical Director & Principal Engineer designing a Multiple Choice Question (MCQ) technical assessment bank for the role of "${roleName}" at the "${experienceLevel}" experience level.
${customFocus ? `Special focus area: ${customFocus}` : ''}

Generate EXACTLY ${count} distinct, high-quality MCQ questions categorized as follows:
- ${basicCount} 'basic' questions (fundamentals, core concepts - balanced mix of easy, medium, hard)
- ${domainCount} 'domain' questions (deep role-specific tech stack, architecture - balanced mix of easy, medium, hard)
- ${trendsCount} 'trends' questions (modern tools, industry shifts - balanced mix of easy, medium, hard)
- ${situationalCount} 'situational' questions (real-world scenarios, debugging, tradeoffs - balanced mix of easy, medium, hard)

For each question:
- Provide 'questionText'
- Provide 'options': an array of EXACTLY 4 distinct option choices (labeled "A) ...", "B) ...", "C) ...", "D) ...")
- Provide 'correctAnswer': the letter ("A", "B", "C", or "D") or full text matching the correct option.
- Provide 'keyEvaluationCriteria': 1-2 points explaining why the correct answer is right and why the distractor options are incorrect.`;

        responseSchema = {
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
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array of exactly 4 option choices (A, B, C, D)",
                  },
                  correctAnswer: { type: Type.STRING, description: "The correct option (e.g. 'A', 'B', 'C', or 'D', or full text)" },
                  keyEvaluationCriteria: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['id', 'category', 'difficulty', 'questionText', 'options', 'correctAnswer'],
              },
            },
          },
          required: ['roleName', 'experienceLevel', 'description', 'questions'],
        };
      } else {
        prompt = `You are an expert HR Technical Director & Principal Engineer designing a comprehensive technical interview question bank for the role of "${roleName}" at the "${experienceLevel}" experience level.
${customFocus ? `Special focus area: ${customFocus}` : ''}

Generate EXACTLY ${count} distinct, high-quality interview questions categorized as follows:
- ${basicCount} 'basic' questions (fundamentals, core concepts - balanced mix of easy, medium, hard)
- ${domainCount} 'domain' questions (deep role-specific tech stack, architecture - balanced mix of easy, medium, hard)
- ${trendsCount} 'trends' questions (modern tools, industry shifts - balanced mix of easy, medium, hard)
- ${situationalCount} 'situational' questions (real-world scenarios, debugging, tradeoffs - balanced mix of easy, medium, hard)

For each question, provide 3 to 5 clear, objective key evaluation criteria points that candidate answers should be scored against.`;

        responseSchema = {
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
        };
      }

      const response = await callGeminiWithRetry({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
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
        assessmentType: isMcq ? 'mcq' : 'descriptive',
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
      const { candidateName, candidateEmail, roleName, experienceLevel, questionSessions, assessmentType } = req.body;
      if (!candidateName || !roleName || !questionSessions) {
        return res.status(400).json({ error: 'candidateName, roleName, and questionSessions are required' });
      }

      const isMcq = assessmentType === 'mcq' || Boolean(questionSessions[0]?.question?.options?.length);

      // Server-side MCQ answer correctness evaluation
      const checkMcqCorrect = (correctRaw: string | undefined, selectedRaw: string | undefined, options: string[] = []) => {
        if (!correctRaw || !selectedRaw) return false;
        const norm = (str: string) => str.trim().toLowerCase().replace(/^(option\s+)?[a-d][\)\.\:\-]?\s*/i, '').trim();
        const getLetter = (str: string) => {
          const match = str.trim().toUpperCase().match(/^(OPTION\s+)?([A-D])([\)\.\:\-]|(\s+.*))?$/);
          return match ? match[2] : null;
        };
        const nSel = norm(selectedRaw);
        const nCorr = norm(correctRaw);
        const lSel = getLetter(selectedRaw);
        const lCorr = getLetter(correctRaw);

        if (lSel && lCorr && lSel === lCorr) return true;
        if (nSel && nCorr && nSel === nCorr) return true;

        if (options && options.length > 0) {
          let selIdx = options.findIndex((opt) => opt === selectedRaw || norm(opt) === nSel);
          if (selIdx === -1 && lSel) selIdx = ['A', 'B', 'C', 'D'].indexOf(lSel);
          let corrIdx = options.findIndex((opt) => opt === correctRaw || norm(opt) === nCorr);
          if (corrIdx === -1 && lCorr) corrIdx = ['A', 'B', 'C', 'D'].indexOf(lCorr);
          if (selIdx !== -1 && corrIdx !== -1 && selIdx === corrIdx) return true;
        }

        if (nSel.length > 2 && nCorr.length > 2 && (nSel.includes(nCorr) || nCorr.includes(nSel))) return true;
        return false;
      };

      // Ensure evaluation score on each MCQ session is set accurately
      let totalMcqCorrect = 0;
      if (isMcq) {
        questionSessions.forEach((s: any) => {
          const isCorrect = checkMcqCorrect(s.question?.correctAnswer, s.candidateAnswer, s.question?.options);
          if (isCorrect) totalMcqCorrect += 1;
          s.evaluation = {
            score: isCorrect ? 100 : 0,
            technicalAccuracy: isCorrect ? 100 : 0,
            completeness: 100,
            clarity: 100,
            keyPointsCovered: isCorrect ? ['Selected Correct Option'] : ['Option Selected'],
            missingOrInaccuratePoints: isCorrect ? [] : [`Correct answer: ${s.question?.correctAnswer || 'N/A'}`],
            constructiveFeedback: isCorrect
              ? 'Correct option selected'
              : `Incorrect option selected. Correct answer was ${s.question?.correctAnswer || 'N/A'}`,
            suggestedDifficultyShift: 'same',
          };
        });
      }

      const mcqCalculatedScore = isMcq
        ? Math.round((totalMcqCorrect / Math.max(1, questionSessions.length)) * 100)
        : 0;

      const totalTimeSpentSeconds = questionSessions.reduce((acc: number, s: any) => acc + (s.timeSpentSeconds || 0), 0);

      const categories = ['basic', 'domain', 'trends', 'situational'] as const;
      const categoryBreakdown = categories.map((cat) => {
        const catSessions = questionSessions.filter((s: any) => s.question?.category === cat);
        const totalScore = catSessions.reduce((acc: number, s: any) => acc + (s.evaluation?.score || 0), 0);
        const avgScore = catSessions.length > 0 ? Math.round(totalScore / catSessions.length) : 0;

        return {
          category: cat,
          categoryName:
            cat === 'basic'
              ? 'Basic Fundamentals'
              : cat === 'domain'
              ? 'Domain Specific'
              : cat === 'trends'
              ? 'Recent Trends'
              : 'Situational / Scenarios',
          score: avgScore,
          questionsAnswered: catSessions.length,
          easyCount: catSessions.filter((s: any) => s.question?.difficulty === 'easy').length,
          mediumCount: catSessions.filter((s: any) => s.question?.difficulty === 'medium').length,
          hardCount: catSessions.filter((s: any) => s.question?.difficulty === 'hard').length,
        };
      });

      let parsed: any = null;

      if (process.env.GEMINI_API_KEY) {
        try {
          let prompt = '';

          if (isMcq) {
            const mcqSummary = questionSessions
              .map((s: any, idx: number) => {
                return `[Question ${idx + 1}] (${s.question?.category} - ${s.question?.difficulty})
Q: "${s.question?.questionText}"
Options: ${(s.question?.options || []).join(' | ')}
Correct Answer: "${s.question?.correctAnswer}"
Candidate's Selected Answer: "${s.candidateAnswer}"
Is Correct: ${s.evaluation?.score === 100 ? 'YES' : 'NO'}`;
              })
              .join('\n\n');

            prompt = `You are a Chief Talent Officer reviewing an MCQ technical assessment for candidate "${candidateName}" applying for "${experienceLevel}" "${roleName}".

MCQ SCORE SUMMARY: Candidate correctly answered ${totalMcqCorrect} out of ${questionSessions.length} questions (${mcqCalculatedScore}% accuracy).

MCQ TRANSCRIPT:
${mcqSummary}

Generate a sharp candidate report with:
1. overallScore: ${mcqCalculatedScore}
2. recommendation: ('Strong Hire', 'Hire', 'Borderline', 'No Hire')
3. summary: Executive summary formatted as bullet points (using "• " prefix):
   • Score & Accuracy Summary: ${totalMcqCorrect}/${questionSessions.length} correct (${mcqCalculatedScore}% accuracy).
   • Technical Alignment: Core concept strength vs domain knowledge accuracy.
   • Test Execution: Response speed and accuracy consistency.
4. strengths: 3 to 4 short single-sentence bullet points (max 15 words each).
5. weaknesses: 3 to 4 short single-sentence bullet points (max 15 words each).
6. followUpQuestionsForInterviewer: 3 concise probing questions for the live round.`;
          } else {
            const sessionsSummary = questionSessions
              .map((s: any, idx: number) => {
                return `[Question ${idx + 1}] (${s.question?.category} - ${s.question?.difficulty})
Q: "${s.question?.questionText}"
A: "${s.candidateAnswer}"
Time Spent: ${s.timeSpentSeconds || 0} seconds
Score: ${s.evaluation?.score ?? 'N/A'}/100
Feedback: "${s.evaluation?.constructiveFeedback || ''}"
Missing: ${(s.evaluation?.missingOrInaccuratePoints || []).join('; ')}`;
              })
              .join('\n\n');

            prompt = `You are a Chief Talent Officer reviewing an automated AI interview for candidate "${candidateName}" applying for "${experienceLevel}" "${roleName}".

INTERVIEW TRANSCRIPT:
${sessionsSummary}

Generate a report with:
1. overallScore: (0-100 calculated average)
2. recommendation: ('Strong Hire', 'Hire', 'Borderline', 'No Hire')
3. summary: Bullet points with "• " prefix reviewing Technical Alignment, Answer Style, Response Pace, and Grammar/Tone.
4. strengths: 3-4 short single-sentence bullet points (max 15 words each).
5. weaknesses: 3-4 short single-sentence bullet points (max 15 words each).
6. followUpQuestionsForInterviewer: 3-4 concise probing questions for the live round.`;
          }

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
          parsed = JSON.parse(jsonText);
        } catch (geminiErr) {
          console.warn('Gemini report generation failed, using structured fallback report:', geminiErr);
        }
      }

      const finalScore = isMcq
        ? mcqCalculatedScore
        : Math.min(100, Math.max(0, Math.round(parsed?.overallScore ?? (categoryBreakdown.reduce((a, c) => a + c.score, 0) / Math.max(1, categoryBreakdown.length)))));

      const finalRecommendation = parsed?.recommendation && ['Strong Hire', 'Hire', 'Borderline', 'No Hire'].includes(parsed.recommendation)
        ? parsed.recommendation
        : finalScore >= 80 ? 'Strong Hire' : finalScore >= 65 ? 'Hire' : finalScore >= 45 ? 'Borderline' : 'No Hire';

      const report = {
        id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        candidateName,
        candidateEmail: candidateEmail || '',
        roleName,
        experienceLevel,
        completedAt: new Date().toISOString(),
        totalTimeSpentSeconds,
        assessmentType: isMcq ? 'mcq' : 'descriptive',
        overallScore: finalScore,
        recommendation: finalRecommendation,
        summary: parsed?.summary || (isMcq
          ? `• Score & Accuracy Summary: Candidate scored ${totalMcqCorrect} out of ${questionSessions.length} (${mcqCalculatedScore}% accuracy).\n• Assessment Completion: Completed all multiple choice questions across all categories.\n• Total Duration: Assessment finished in ${totalTimeSpentSeconds} seconds.`
          : `• Technical Alignment: Completed automated interview for ${roleName}.\n• Overall Performance: Average evaluated score of ${finalScore}/100 across ${questionSessions.length} questions.\n• Completion Pace: Total elapsed time of ${totalTimeSpentSeconds} seconds.`),
        strengths: parsed?.strengths || (isMcq
          ? [`Achieved ${mcqCalculatedScore}% overall accuracy on technical MCQ questions.`, `Demonstrated solid time management completing assessment in ${totalTimeSpentSeconds}s.`]
          : [`Completed full ${questionSessions.length}-question interview session.`, `Demonstrated consistent technical answers across evaluated categories.`]),
        weaknesses: parsed?.weaknesses || (isMcq
          ? [`Answered ${questionSessions.length - totalMcqCorrect} question(s) incorrectly during the test.`, `Review missed concept choices in lower scoring category sections.`]
          : [`Review feedback notes on lower scoring response sessions.`, `Further face-to-face technical verification recommended.`]),
        categoryBreakdown,
        followUpQuestionsForInterviewer: parsed?.followUpQuestionsForInterviewer || [
          `Ask candidate to walk through their technical reasoning on missed questions.`,
          `Probe into production architecture decisions related to ${roleName}.`,
          `Discuss real-world trade-offs in candidate's primary domain of expertise.`
        ],
        questionSessions,
      };

      res.json(report);
    } catch (err: any) {
      console.error('Error generating report:', err);
      res.status(500).json({ error: formatGeminiError(err) });
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
