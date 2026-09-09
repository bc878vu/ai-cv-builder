import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Use a stable model for production compatibility across Google AI Studio projects.
const MODEL = 'gemini-2.5-flash';

function providerMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (normalized.includes('api key') || normalized.includes('unauthenticated') || normalized.includes('permission') || normalized.includes('forbidden')) {
    return 'Gemini API authentication failed. Check GEMINI_API_KEY and make sure the key has Gemini API access.';
  }
  if (normalized.includes('quota') || normalized.includes('resource exhausted') || normalized.includes('rate limit')) {
    return 'Gemini API quota/rate limit was reached. Please wait and try again.';
  }
  if (normalized.includes('not found') || normalized.includes('model') || normalized.includes('unsupported')) {
    return `Gemini model ${MODEL} is unavailable for this API key/project. Verify Gemini API access for the selected Google AI Studio project.`;
  }
  if (normalized.includes('billing') || normalized.includes('payment')) {
    return 'Gemini API billing/access is required for this request. Check the billing or rate-limit settings of the selected project.';
  }
  return 'Gemini AI request failed. Please try again. If it continues, check the Vercel function logs.';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, cv, jobDescription } = body ?? {};
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 503 },
      );
    }

    if (!['summary', 'experience', 'ats'].includes(action)) {
      return NextResponse.json({ error: 'Invalid AI action.' }, { status: 400 });
    }

    const task = action === 'summary'
      ? 'Improve the professional summary. Keep every claim grounded in the provided CV and never invent experience, employers, education, dates, skills, or metrics.'
      : action === 'experience'
        ? 'Rewrite the experience bullets using concise action + impact wording. Preserve the original facts and never invent metrics, responsibilities, tools, or achievements.'
        : 'Analyze ATS alignment against the job description. Extract important keywords, identify gaps, and recommend only truthful additions. Never tell the user to claim a skill they do not have.';

    const prompt = `${task}\n\nReturn a concise, professional answer for a CV editor. For ATS analysis, clearly separate matching keywords, missing keywords, and actionable recommendations. Never fabricate facts.\n\nCV JSON:\n${JSON.stringify(cv ?? {})}\n\nJob description:\n${jobDescription || '(none)'}`;

    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { maxOutputTokens: 1200 },
    });

    const text = result.text?.trim();
    if (!text) {
      return NextResponse.json({ error: 'Gemini returned an empty response. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Gemini AI error:', error);
    return NextResponse.json({ error: providerMessage(error) }, { status: 502 });
  }
}
