import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const tableUrl = () => {
  const base = process.env.SUPABASE_URL;
  return base ? `${base.replace(/\/$/, '')}/rest/v1/feedback` : null;
};

const headers = () => ({
  apikey: process.env.SUPABASE_ANON_KEY ?? '',
  Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY ?? ''}`,
  'Content-Type': 'application/json',
});

export async function GET() {
  const url = tableUrl();
  if (!url || !process.env.SUPABASE_ANON_KEY) return NextResponse.json({ configured: false, reviews: [] });
  const response = await fetch(`${url}?select=id,name,rating,review,created_at&order=created_at.desc&limit=100`, { headers: headers(), cache: 'no-store' });
  if (!response.ok) return NextResponse.json({ configured: false, reviews: [] }, { status: 200 });
  return NextResponse.json({ configured: true, reviews: await response.json() });
}

export async function POST(request: Request) {
  const url = tableUrl();
  if (!url || !process.env.SUPABASE_ANON_KEY) return NextResponse.json({ configured: false, message: 'Public feedback storage is not configured yet.' }, { status: 503 });

  const body = await request.json().catch(() => null) as { name?: unknown; rating?: unknown; review?: unknown } | null;
  const name = String(body?.name ?? '').trim().slice(0, 60);
  const review = String(body?.review ?? '').trim().slice(0, 1000);
  const rating = Number(body?.rating);
  if (!name || !review || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ message: 'Please provide your name, a 1–5 star rating and a review.' }, { status: 400 });

  const response = await fetch(url, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=representation' },
    body: JSON.stringify({ name, rating, review }),
  });
  if (!response.ok) return NextResponse.json({ message: 'Unable to save feedback right now.' }, { status: 500 });
  return NextResponse.json({ review: (await response.json())[0] });
}
