import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://bewxefxjbvbumajflhfw.supabase.co').replace(/\/$/, '');
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_HcJP12XHbtaBbskA8PwJRA_0GS-xNa3';
const allowed = new Set(['page_view', 'session_start', 'account_created', 'cv_created', 'cv_exported']);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event_name = String(body?.event_name || '');
    const visitor_id = String(body?.visitor_id || '').slice(0, 120);
    const path = String(body?.path || '/').slice(0, 300);
    if (!allowed.has(event_name) || visitor_id.length < 8 || path.length < 1) {
      return NextResponse.json({ message: 'Invalid analytics event.' }, { status: 400 });
    }
    const response = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ event_name, visitor_id, path, metadata: {} }),
      cache: 'no-store',
    });
    if (!response.ok) return NextResponse.json({ message: 'Analytics unavailable.' }, { status: 503 });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ message: 'Analytics unavailable.' }, { status: 503 });
  }
}
