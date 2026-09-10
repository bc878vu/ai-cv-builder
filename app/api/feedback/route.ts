import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://bewxefxjbvbumajflhfw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? 'sb_publishable_HcJP12XHbtaBbskA8PwJRA_0GS-xNa3';
const WINDOW_MS = 15 * 60 * 1000;
const MAX_SUBMISSIONS = 5;
type Bucket = { count:number; resetAt:number };
const buckets = new Map<string, Bucket>();

const tableUrl = () => `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/feedback`;
const headers = () => ({ apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' });
const clientKey = (request:Request) => request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous';
function allowSubmission(key:string){const now=Date.now();const bucket=buckets.get(key);if(!bucket||bucket.resetAt<=now){buckets.set(key,{count:1,resetAt:now+WINDOW_MS});return true}if(bucket.count>=MAX_SUBMISSIONS)return false;bucket.count+=1;return true}

export async function GET() {
  try {
    const response = await fetch(`${tableUrl()}?select=id,name,rating,review,created_at&order=created_at.desc&limit=100`, { headers: headers(), cache: 'no-store' });
    if (!response.ok) return NextResponse.json({ configured: false, reviews: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
    return NextResponse.json({ configured: true, reviews: await response.json() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ configured: false, reviews: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request: Request) {
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({ message:'Cross-site requests are not allowed.' },{status:403});
  if(!allowSubmission(clientKey(request)))return NextResponse.json({ message:'You have submitted several reviews recently. Please wait before submitting another.' },{status:429,headers:{'Retry-After':String(Math.ceil(WINDOW_MS/1000))}});
  const contentLength=Number(request.headers.get('content-length')||0);
  if(contentLength>5000)return NextResponse.json({ message:'Feedback submission is too large.' },{status:413});
  const body = await request.json().catch(() => null) as { name?: unknown; rating?: unknown; review?: unknown } | null;
  const name = String(body?.name ?? '').trim().slice(0, 60);
  const review = String(body?.review ?? '').trim().slice(0, 1000);
  const rating = Number(body?.rating);
  if (!name || !review || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ message: 'Please provide your name, a 1–5 star rating and a review.' }, { status: 400 });
  try {
    const response = await fetch(tableUrl(), { method:'POST', headers:{...headers(),Prefer:'return=representation'}, body:JSON.stringify({name,rating,review}), cache:'no-store' });
    if (!response.ok) return NextResponse.json({ message:'Unable to save feedback right now.' }, { status:500 });
    return NextResponse.json({ review:(await response.json())[0] }, { headers:{'Cache-Control':'no-store'} });
  } catch {
    return NextResponse.json({ message:'Unable to save feedback right now.' }, { status:500 });
  }
}
