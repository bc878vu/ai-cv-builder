import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://bewxefxjbvbumajflhfw.supabase.co').replace(/\/$/, '');
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_HcJP12XHbtaBbskA8PwJRA_0GS-xNa3';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const allowed = new Set(['page_view', 'session_start', 'page_exit', 'account_created', 'cv_created', 'cv_exported']);

function firstHeader(request: Request, names: string[]) {
  for (const name of names) {
    const value = request.headers.get(name);
    if (value) return value.split(',')[0].trim().slice(0, 160);
  }
  return '';
}

function safeMetadata(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  const output: Record<string, number | string> = {};
  for (const key of ['duration_ms', 'render_ms', 'referrer']) {
    const item = input[key];
    if (typeof item === 'number' && Number.isFinite(item)) output[key] = Math.max(0, Math.min(item, 86400000));
    if (key === 'referrer' && typeof item === 'string') output[key] = item.slice(0, 200);
  }
  return output;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event_name = String(body?.event_name || '');
    const visitor_id = String(body?.visitor_id || '').slice(0, 120);
    const path = String(body?.path || '/').slice(0, 300);
    const metadata = safeMetadata(body?.metadata);
    if (!allowed.has(event_name) || visitor_id.length < 8 || path.length < 1) {
      return NextResponse.json({ message: 'Invalid analytics event.' }, { status: 400 });
    }

    const ip_address = firstHeader(request, ['x-forwarded-for', 'x-real-ip', 'x-vercel-forwarded-for']) || 'unknown';
    let city = firstHeader(request, ['x-vercel-ip-city', 'x-city']);
    try { city = decodeURIComponent(city); } catch { /* keep raw header */ }
    const country = firstHeader(request, ['x-vercel-ip-country', 'x-country']);
    const user_agent = (request.headers.get('user-agent') || '').slice(0, 500);

    if (SERVICE_KEY && ip_address !== 'unknown') {
      const blocked = await fetch(`${SUPABASE_URL}/rest/v1/blocked_ips?select=id&ip_address=eq.${encodeURIComponent(ip_address)}&limit=1`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }, cache: 'no-store'
      });
      if (blocked.ok && (await blocked.json()).length) return new NextResponse(null, { status: 204 });
    }

    const key = SERVICE_KEY || ANON_KEY;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ event_name, visitor_id, path, metadata, ip_address, city, country, user_agent }),
      cache: 'no-store',
    });
    if (!response.ok) return NextResponse.json({ message: 'Analytics unavailable.' }, { status: 503 });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ message: 'Analytics unavailable.' }, { status: 503 });
  }
}
