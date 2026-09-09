import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

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

    const task = action === 'summary'
      ? 'Improve the professional summary. Keep every claim grounded in the provided CV and never invent experience, employers, education, dates, skills, or metrics.'
      : action === 'experience'
        ? 'Rewrite the experience bullets using concise action + impact wording. Preserve the original facts and never invent metrics, responsibilities, tools, or achievements.'
        : 'Analyze ATS alignment against the job description. Extract important keywords, identify gaps, and recommend only truthful additions. Never tell the user to claim a skill they do not have.';

    const prompt = `${task}\n\nReturn a concise, professional answer that can be used by a CV editor.\n\nCV JSON:\n${JSON.stringify(cv)}\n\nJob description:\n${jobDescription || '(none)'}`;

    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 1200,
      },
    });

    return NextResponse.json({ text: result.text || 'No AI response was generated.' });
  } catch (error) {
    console.error('Gemini AI error:', error);
    return NextResponse.json({ error: 'Gemini AI request failed.' }, { status: 500 });
  }
}
