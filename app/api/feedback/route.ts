import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// The Supabase publishable key is intentionally safe for public Data API use.
// Environment variables remain preferred when configured in the deployment.
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://bewxefxjbvbumajflhfw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? 'sb_publishable_HcJP12XHbtaBbskA8PwJRA_0GS-xNa3';

const tableUrl = () => `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/feedback`;

const headers = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
});

export async function GET() {
  const response = await fetch(`${tableUrl()}?select=id,name,rating,review,created_at&order=created_at.desc&limit=100`, { headers: headers(), cache: 'no-store' });
  if (!response.ok) return NextResponse.json({ configured: false, reviews: [] }, { status: 200 });
  return NextResponse.json({ configured: true, reviews: await response.json() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { name?: unknown; rating?: unknown; review?: unknown } | null;
  const name = String(body?.name ?? '').trim().slice(0, 60);
  const review = String(body?.review ?? '').trim().slice(0, 1000);
  const rating = Number(body?.rating);
  if (!name || !review || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ message: 'Please provide your name, a 1–5 star rating and a review.' }, { status: 400 });

  const response = await fetch(tableUrl(), {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=representation' },
    body: JSON.stringify({ name, rating, review }),
  });
  if (!response.ok) return NextResponse.json({ message: 'Unable to save feedback right now.' }, { status: 500 });
  return NextResponse.json({ review: (await response.json())[0] });
}
