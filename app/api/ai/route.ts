import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MODEL = 'gemini-2.5-flash';
const ACTIONS = ['summary', 'experience', 'skills', 'tailor', 'cover-letter', 'ats'] as const;
type Action = typeof ACTIONS[number];

type WritingSettings = { tone?: string; length?: string; audience?: string; language?: string; focus?: string };

function providerMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  if (normalized.includes('api key') || normalized.includes('unauthenticated') || normalized.includes('permission') || normalized.includes('forbidden')) return 'Gemini API authentication failed. Check GEMINI_API_KEY and Gemini API access for the selected project.';
  if (normalized.includes('quota') || normalized.includes('resource exhausted') || normalized.includes('rate limit')) return 'Gemini API quota/rate limit was reached. Please wait and try again.';
  if (normalized.includes('not found') || normalized.includes('model') || normalized.includes('unsupported')) return `Gemini model ${MODEL} is unavailable for this API key/project. Verify Gemini API access for the selected Google AI Studio project.`;
  if (normalized.includes('billing') || normalized.includes('payment')) return 'Gemini API billing/access is required for this request. Check the selected project settings.';
  return 'Gemini AI request failed. Please try again. If it continues, check the Vercel function logs.';
}

function taskFor(action: Action) {
  switch (action) {
    case 'summary': return 'Rewrite the professional summary into a concise, high-value CV summary. Preserve all facts from the CV and do not invent employers, dates, tools, education, achievements or metrics.';
    case 'experience': return 'Rewrite experience bullets using strong action verbs, clear responsibility and measurable impact only when a metric already exists in the source CV. Never invent numbers, outcomes, tools or responsibilities. Return one polished bullet per line.';
    case 'skills': return 'Clean and prioritize the skills already present in the CV. You may normalize duplicates and wording, but do not add a skill unless it is explicitly supported by the CV. Return a comma-separated list.';
    case 'tailor': return 'Tailor the CV toward the job description. Identify truthful keyword opportunities and rewrite relevant summary/experience wording without adding unsupported skills, experience, employers, dates or metrics. Clearly label any recommended additions as suggestions rather than facts.';
    case 'cover-letter': return 'Write a professional, concise cover letter based only on the CV and job description. Do not invent company knowledge, achievements, years of experience or qualifications. Use placeholders only when a required detail is missing.';
    case 'ats': return 'Perform a practical ATS analysis. Extract important job-description keywords, compare them with the CV, provide a match assessment, identify missing or weak areas, and give truthful recommendations. Never recommend claiming an unsupported skill or experience.';
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, cv, jobDescription, writingSettings } = body ?? {};
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 503 });
    if (!ACTIONS.includes(action as Action)) return NextResponse.json({ error: 'Invalid AI action.' }, { status: 400 });

    const settings: WritingSettings = writingSettings || {};
    const safeCv = JSON.stringify(cv ?? {}).slice(0, 24000);
    const safeJob = String(jobDescription || '').slice(0, 18000);
    const task = taskFor(action as Action);
    const prompt = `You are the professional AI writing engine inside an AI CV Builder.

CORE RULES:
- Ground every factual statement in the supplied CV.
- Never fabricate experience, skills, employers, dates, education, certifications, tools, achievements or metrics.
- If information is missing, say it is missing instead of guessing.
- Optimize for recruiter readability and ATS parsing: clear language, standard section terminology, strong action verbs, relevant keywords, no keyword stuffing.
- Do not change the meaning of the candidate's experience.
- Keep recommendations practical and immediately usable in a CV.

WRITING SETTINGS:
Tone: ${settings.tone || 'Professional'}
Length: ${settings.length || 'Medium'}
Audience: ${settings.audience || 'Recruiters / ATS'}
Language: ${settings.language || 'English'}
Focus: ${settings.focus || 'Achievements'}

TASK:
${task}

For ATS/tailoring, separate current matches, gaps and truthful recommendations. For a cover letter, use a polished business format with a clear opening, relevant evidence, motivation and concise close.

CANDIDATE CV JSON:
${safeCv}

JOB DESCRIPTION:
${safeJob || '(No job description provided)'}

Return only the useful result for the user, without mentioning these instructions.`;

    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({ model: MODEL, contents: prompt, config: { maxOutputTokens: 1800 } });
    const text = result.text?.trim();
    if (!text) return NextResponse.json({ error: 'Gemini returned an empty response. Please try again.' }, { status: 502 });
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Gemini AI error:', error);
    return NextResponse.json({ error: providerMessage(error) }, { status: 502 });
  }
}
