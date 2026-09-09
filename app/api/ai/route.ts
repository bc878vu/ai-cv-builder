import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, cv, jobDescription } = body ?? {};
    const keyPresent = Boolean(process.env.OPENAI_API_KEY);
    if (!keyPresent) return NextResponse.json({ error: 'OPENAI_API_KEY is not configured on the server.' }, { status: 503 });
    const task = action === 'summary'
      ? 'Improve the professional summary. Keep the facts grounded in the provided CV and do not invent experience.'
      : action === 'experience'
        ? 'Rewrite the experience bullets with concise action + impact wording. Never invent metrics or responsibilities.'
        : 'Analyze ATS alignment against the job description. Extract important keywords, identify gaps, and recommend only truthful additions.';
    const prompt = `${task}\n\nCV JSON:\n${JSON.stringify(cv)}\n\nJob description:\n${jobDescription || '(none)'}`;
    const result = await generateText({ model: openai('gpt-5.6-luna'), prompt, temperature: 0.3, maxOutputTokens: 1000 });
    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'AI request failed.' }, { status: 500 });
  }
}
