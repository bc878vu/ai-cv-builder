import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../admin-auth';

export const dynamic = 'force-dynamic';

type Event = { event_name?: string; visitor_id?: string; path?: string; created_at?: string; ip_address?: string; city?: string; country?: string; user_agent?: string; metadata?: Record<string, unknown> };

function numberMeta(event: Event, key: string) {
  const value = event.metadata?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;
}

export async function GET(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: 'Admin authentication required.' }, { status: 401 }); }
  const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key) return NextResponse.json({ message: 'Analytics database access is not configured.' }, { status: 503 });

  try {
    const url = new URL(request.url);
    const requestedDays = Number(url.searchParams.get('days') || 30);
    const days = [7, 14, 30, 90].includes(requestedDays) ? requestedDays : 30;
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const response = await fetch(`${base}/rest/v1/analytics_events?select=event_name,visitor_id,path,created_at,ip_address,city,country,user_agent,metadata&created_at=gte.${encodeURIComponent(since)}&order=created_at.asc&limit=50000`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' });
    if (!response.ok) return NextResponse.json({ message: 'Unable to load analytics.' }, { status: 500 });
    const events = await response.json() as Event[];
    const daily: Array<{date:string;visits:number;uniqueVisitors:number;sessions:number;accounts:number;cvs:number;exports:number}> = [];
    const totals = { visits:0, uniqueVisitors:0, sessions:0, accounts:0, cvs:0, exports:0 };
    const visitors = new Set<string>();
    for (let i=days-1;i>=0;i-=1) {
      const date = new Date(); date.setHours(0,0,0,0); date.setDate(date.getDate()-i);
      const day = date.toISOString().slice(0,10);
      const item = { date: day, visits:0, uniqueVisitors:0, sessions:0, accounts:0, cvs:0, exports:0 };
      const dayVisitors = new Set<string>();
      for (const event of events) if (String(event.created_at || '').slice(0,10) === day) {
        if (event.event_name === 'page_view') { item.visits += 1; if (event.visitor_id) { dayVisitors.add(event.visitor_id); visitors.add(event.visitor_id); } }
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

    const pageCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};
    const hourCounts: Record<string, number> = {};
    const pagePerformance = new Map<string, { samples: number; renderTotal: number; durationSamples: number; durationTotal: number }>();
    const visitorMap = new Map<string, {visitorId:string;ipAddress:string;city:string;country:string;lastSeen:string;visits:number}>();

    for (const event of events) {
      const path = event.path || '/';
      if (event.event_name === 'page_view') {
        pageCounts[path] = (pageCounts[path] || 0) + 1;
        if (event.country) countryCounts[event.country] = (countryCounts[event.country] || 0) + 1;
        if (event.city) cityCounts[event.city] = (cityCounts[event.city] || 0) + 1;
        const hour = event.created_at ? new Date(event.created_at).getHours().toString().padStart(2, '0') + ':00' : 'Unknown';
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        const performance = pagePerformance.get(path) || { samples:0, renderTotal:0, durationSamples:0, durationTotal:0 };
        const render = numberMeta(event, 'render_ms');
        if (render > 0) { performance.samples += 1; performance.renderTotal += render; }
        pagePerformance.set(path, performance);
      }
      if (event.event_name === 'page_exit') {
        const performance = pagePerformance.get(path) || { samples:0, renderTotal:0, durationSamples:0, durationTotal:0 };
        const duration = numberMeta(event, 'duration_ms');
        if (duration > 0) { performance.durationSamples += 1; performance.durationTotal += duration; }
        pagePerformance.set(path, performance);
      }
      if (event.visitor_id) {
        const current = visitorMap.get(event.visitor_id);
        if (!current || String(event.created_at || '') > current.lastSeen) visitorMap.set(event.visitor_id, { visitorId:event.visitor_id, ipAddress:event.ip_address || 'unknown', city:event.city || 'Unknown', country:event.country || 'Unknown', lastSeen:event.created_at || '', visits:(current?.visits || 0) + (event.event_name === 'page_view' ? 1 : 0) });
        else if (event.event_name === 'page_view') current.visits += 1;
      }
    }

    const topPages = Object.entries(pageCounts).sort((a,b) => b[1] - a[1]).slice(0,10).map(([path,visits]) => ({path,visits}));
    const countries = Object.entries(countryCounts).sort((a,b) => b[1] - a[1]).slice(0,10).map(([country,visits]) => ({country,visits}));
    const cities = Object.entries(cityCounts).sort((a,b) => b[1] - a[1]).slice(0,10).map(([city,visits]) => ({city,visits}));
    const hourly = Object.entries(hourCounts).sort((a,b) => a[0].localeCompare(b[0])).map(([hour,visits]) => ({hour,visits}));
    const slowPages = Array.from(pagePerformance.entries()).map(([path,metrics]) => ({ path, averageRenderMs: metrics.samples ? Math.round(metrics.renderTotal / metrics.samples) : 0, averageDurationMs: metrics.durationSamples ? Math.round(metrics.durationTotal / metrics.durationSamples) : 0, samples: metrics.samples, durationSamples: metrics.durationSamples })).filter(item => item.averageRenderMs > 0 || item.averageDurationMs > 0).sort((a,b) => b.averageRenderMs - a.averageRenderMs).slice(0,10);
    const visitorsList = Array.from(visitorMap.values()).sort((a,b) => b.lastSeen.localeCompare(a.lastSeen)).slice(0,100);
    const blockedResponse = await fetch(`${base}/rest/v1/blocked_ips?select=id,ip_address,reason,created_at&order=created_at.desc&limit=200`, { headers: { apikey:key, Authorization:`Bearer ${key}` }, cache:'no-store' });
    const blocked = blockedResponse.ok ? await blockedResponse.json() : [];
    return NextResponse.json({ range:`${days}d`, days, totals, daily, topPages, countries, cities, hourly, slowPages, visitors:visitorsList, blocked });
  } catch { return NextResponse.json({ message: 'Unable to load analytics.' }, { status: 500 }); }
}
