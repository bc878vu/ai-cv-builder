import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: 'Admin authentication required.' }, { status: 401 }); }
  const visitorId = new URL(request.url).searchParams.get('visitor_id') || '';
  const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key || visitorId.length < 8 || visitorId.length > 120) return NextResponse.json({ message: 'Invalid visitor id.' }, { status: 400 });
  try {
    const response = await fetch(`${base}/rest/v1/analytics_events?select=event_name,visitor_id,path,created_at,ip_address,city,country,user_agent,metadata&visitor_id=eq.${encodeURIComponent(visitorId)}&order=created_at.desc&limit=1000`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' });
    if (!response.ok) return NextResponse.json({ message: 'Unable to load visitor history.' }, { status: 500 });
    return NextResponse.json({ visitorId, events: await response.json() });
  } catch { return NextResponse.json({ message: 'Unable to load visitor history.' }, { status: 500 }); }
}
