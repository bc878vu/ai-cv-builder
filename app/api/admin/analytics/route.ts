import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: 'Admin authentication required.' }, { status: 401 });
  }

  const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key) {
    return NextResponse.json({ message: 'Analytics database access is not configured.' }, { status: 503 });
  }

  try {
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const response = await fetch(`${base}/rest/v1/analytics_events?select=event_name,visitor_id,path,created_at&created_at=gte.${encodeURIComponent(since)}&order=created_at.asc&limit=10000`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    });
    if (!response.ok) return NextResponse.json({ message: 'Unable to load analytics.' }, { status: 500 });

    const events = await response.json();
    const daily = [];
    const totals = { visits: 0, uniqueVisitors: 0, sessions: 0, accounts: 0, cvs: 0, exports: 0 };
    const visitors = new Set();

    for (let i = 29; i >= 0; i -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      const day = date.toISOString().slice(0, 10);
      const item = { date: day, visits: 0, uniqueVisitors: 0, sessions: 0, accounts: 0, cvs: 0, exports: 0 };
      const dayVisitors = new Set();

      for (const event of events.filter((entry) => String(entry.created_at || '').slice(0, 10) === day)) {
        if (event.event_name === 'page_view') {
          item.visits += 1;
          if (event.visitor_id) {
            dayVisitors.add(event.visitor_id);
            visitors.add(event.visitor_id);
          }
        }
        if (event.event_name === 'session_start') item.sessions += 1;
        if (event.event_name === 'account_created') item.accounts += 1;
        if (event.event_name === 'cv_created') item.cvs += 1;
        if (event.event_name === 'cv_exported') item.exports += 1;
      }
      item.uniqueVisitors = dayVisitors.size;
      daily.push(item);
    }

    totals.visits = daily.reduce((sum, item) => sum + item.visits, 0);
    totals.uniqueVisitors = visitors.size;
    totals.sessions = daily.reduce((sum, item) => sum + item.sessions, 0);
    totals.accounts = daily.reduce((sum, item) => sum + item.accounts, 0);
    totals.cvs = daily.reduce((sum, item) => sum + item.cvs, 0);
    totals.exports = daily.reduce((sum, item) => sum + item.exports, 0);

    const pageCounts = {};
    for (const event of events) {
      if (event.event_name === 'page_view' && event.path) pageCounts[event.path] = (pageCounts[event.path] || 0) + 1;
    }
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, visits]) => ({ path, visits }));

    return NextResponse.json({ range: '30d', totals, daily, topPages });
  } catch {
    return NextResponse.json({ message: 'Unable to load analytics.' }, { status: 500 });
  }
}
