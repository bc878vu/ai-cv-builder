'use client';

import { useEffect, useMemo, useState } from 'react';

type Daily = { date: string; visits: number; uniqueVisitors: number; sessions: number; accounts: number; cvs: number; exports: number };
type Visitor = { visitorId: string; ipAddress: string; city: string; country: string; lastSeen: string; visits: number };
type Blocked = { id: string; ip_address: string; reason: string; created_at: string };
type Event = { event_name?: string; path?: string; created_at?: string; ip_address?: string; city?: string; country?: string; user_agent?: string; metadata?: Record<string, unknown> };
type Analytics = { range: string; days: number; totals: { visits: number; uniqueVisitors: number; sessions: number; accounts: number; cvs: number; exports: number }; daily: Daily[]; topPages: { path: string; visits: number }[]; countries: { country: string; visits: number }[]; cities: { city: string; visits: number }[]; hourly: { hour: string; visits: number }[]; slowPages: { path: string; averageRenderMs: number; averageDurationMs: number; samples: number; durationSamples: number }[]; visitors: Visitor[]; blocked: Blocked[] };

type History = { visitorId: string; events: Event[] };

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState('30');
  const [ip, setIp] = useState('');
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<History | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/analytics?days=${days}`, { cache: 'no-store' });
      const payload = await response.json();
      if (response.status === 401) { window.location.href = '/admin/login'; return; }
      if (!response.ok) throw new Error(payload.message || 'Analytics unavailable.');
      setData(payload);
    } catch (e) { setError(e instanceof Error ? e.message : 'Analytics unavailable.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [days]);

  const maxVisits = useMemo(() => Math.max(1, ...(data?.daily || []).map((item) => item.visits)), [data]);
  const maxHourVisits = useMemo(() => Math.max(1, ...(data?.hourly || []).map((item) => item.visits)), [data]);
  const visitors = useMemo(() => data?.visitors.filter((item) => `${item.ipAddress} ${item.city} ${item.country}`.toLowerCase().includes(search.toLowerCase())) || [], [data, search]);

  async function openHistory(visitorId: string) {
    setHistoryLoading(true); setError('');
    try {
      const response = await fetch(`/api/admin/visitor-history?visitor_id=${encodeURIComponent(visitorId)}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to load visitor history.');
      setHistory(payload);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load visitor history.'); }
    finally { setHistoryLoading(false); }
  }

  async function block() {
    if (!ip.trim()) return;
    setBusy(true);
    try {
      const response = await fetch('/api/admin/blocked-ips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip_address: ip.trim(), reason: reason.trim() }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to block IP.');
      setIp(''); setReason(''); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to block IP.'); }
    finally { setBusy(false); }
  }

  async function unblock(id: string) {
    setBusy(true);
    try {
      const response = await fetch('/api/admin/blocked-ips', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!response.ok) throw new Error('Unable to unblock IP.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to unblock IP.'); }
    finally { setBusy(false); }
  }

  return <main className="admin-main admin-analytics-page">
    <style jsx global>{`
      .admin-analytics-page{width:100%;min-width:0;box-sizing:border-box}.admin-analytics-page .analytics-content{width:100%;max-width:1440px;margin:auto;display:grid;gap:20px}.admin-analytics-page .admin-top{max-width:1440px;margin:auto;display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap}.admin-analytics-page .admin-stats{grid-template-columns:repeat(6,minmax(0,1fr))}.admin-analytics-page .analytics-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.admin-analytics-page .analytics-bars{display:grid;grid-template-columns:repeat(30,minmax(0,1fr));align-items:end;gap:6px;min-height:220px;padding:20px 5px 0;border-bottom:1px solid #e2e8f0}.admin-analytics-page .analytics-bar-item{min-width:0;height:190px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px}.admin-analytics-page .analytics-bar{width:100%;max-width:26px;min-height:4px;border-radius:7px 7px 2px 2px;background:linear-gradient(180deg,#6366f1,#818cf8)}.admin-analytics-page .analytics-bar-item small{color:#94a3b8;font-size:9px;writing-mode:vertical-rl;transform:rotate(180deg)}.admin-analytics-page .analytics-list-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #eef2f7}.admin-analytics-page .analytics-muted{color:#64748b;font-size:13px;line-height:1.6}.admin-analytics-page .analytics-form{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}.admin-analytics-page .analytics-form label{display:grid;gap:6px;font-size:12px;font-weight:700}.admin-analytics-page .analytics-form input,.admin-analytics-page .analytics-filter{min-width:0;border:1px solid #dbe3ef;border-radius:10px;padding:10px;background:white}.admin-analytics-page .analytics-table{width:100%;overflow:auto}.admin-analytics-page .analytics-table table{min-width:650px}.admin-analytics-page .analytics-mini-bars{display:grid;grid-template-columns:repeat(24,minmax(0,1fr));gap:5px;align-items:end;min-height:150px}.admin-analytics-page .analytics-mini-bar{background:#818cf8;border-radius:5px 5px 0 0;min-height:3px}.admin-analytics-page .analytics-modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.52);z-index:1000;display:grid;place-items:center;padding:18px}.admin-analytics-page .analytics-modal{width:min(900px,100%);max-height:90vh;overflow:auto;background:white;border-radius:20px;padding:24px;box-shadow:0 20px 80px rgba(15,23,42,.25)}.admin-analytics-page .analytics-modal-head{display:flex;justify-content:space-between;gap:12px;align-items:start}.admin-analytics-page .analytics-event{display:grid;grid-template-columns:150px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid #e5e7eb}.admin-analytics-page .analytics-event code{overflow-wrap:anywhere}@media(max-width:1100px){.admin-analytics-page .admin-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:760px){.admin-analytics-page{padding:16px}.admin-analytics-page .admin-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.admin-analytics-page .analytics-grid{grid-template-columns:1fr}.admin-analytics-page .analytics-bars{gap:3px;min-height:180px}.admin-analytics-page .analytics-bar-item{height:155px}.admin-analytics-page .analytics-form{grid-template-columns:1fr}.admin-analytics-page .analytics-form button{width:100%}.admin-analytics-page .analytics-event{grid-template-columns:1fr;gap:4px}}
    `}</style>
    <header className="admin-top"><div><span className="admin-eyebrow">ADMIN ANALYTICS</span><h1>Visitors &amp; Growth</h1><p className="analytics-muted">All public and application pages, visitor geography, time patterns and performance.</p></div><div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}><select className="analytics-filter" value={days} onChange={(event) => setDays(event.target.value)} aria-label="Analytics date range"><option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><button className="admin-secondary" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh data'}</button></div></header>
    <div className="analytics-content">
      {loading && <section className="admin-card"><p>Loading analytics…</p></section>}
      {error && <section className="admin-card"><p className="admin-error">{error}</p></section>}
      {data && <>
        <div className="admin-stats">{Object.entries({Visits:data.totals.visits,'Unique visitors':data.totals.uniqueVisitors,Sessions:data.totals.sessions,Accounts:data.totals.accounts,'CVs created':data.totals.cvs,Exports:data.totals.exports}).map(([label,value])=><article key={label}><strong>{value.toLocaleString()}</strong><span>{label}</span></article>)}</div>
        <section className="admin-card"><div className="admin-card-head"><div><span className="admin-eyebrow">TRAFFIC TREND</span><h2>Daily visits</h2></div><span>{data.range}</span></div><div className="analytics-bars">{data.daily.map((item)=><div className="analytics-bar-item" key={item.date} title={`${item.date}: ${item.visits} visits`}><div className="analytics-bar" style={{height:`${Math.max(3,item.visits/maxVisits*100)}%`}}/><small>{item.date.slice(5)}</small></div>)}</div></section>
        <div className="analytics-grid"><section className="admin-card"><span className="admin-eyebrow">TIME PATTERNS</span><h2>Visits by hour</h2><p className="analytics-muted">When visitors are most active, based on the recorded event time.</p><div className="analytics-mini-bars">{Array.from({length:24},(_,hour)=>{const item=data.hourly.find((entry)=>Number(entry.hour.slice(0,2))===hour);return <div key={hour} title={`${String(hour).padStart(2,'0')}:00 — ${item?.visits||0} visits`} className="analytics-mini-bar" style={{height:`${Math.max(3,(item?.visits||0)/maxHourVisits*130)}px`}}/>;})}</div><div className="analytics-muted">00:00 → 23:00</div></section><section className="admin-card"><span className="admin-eyebrow">GEOGRAPHY</span><h2>Top countries</h2>{data.countries.map((item)=><div className="analytics-list-row" key={item.country}><span>{item.country}</span><b>{item.visits}</b></div>)}{!data.countries.length&&<p className="analytics-muted">No country data yet.</p>}</section></div>
        <div className="analytics-grid"><section className="admin-card"><span className="admin-eyebrow">GEOGRAPHY</span><h2>Top cities</h2>{data.cities.map((item)=><div className="analytics-list-row" key={item.city}><span>{item.city}</span><b>{item.visits}</b></div>)}{!data.cities.length&&<p className="analytics-muted">No city data yet.</p>}</section><section className="admin-card"><span className="admin-eyebrow">PERFORMANCE</span><h2>Slowest pages</h2><p className="analytics-muted">Pages with recorded render or visit-duration samples.</p>{data.slowPages.map((item)=><div className="analytics-list-row" key={item.path}><span><code>{item.path}</code><br/><small className="analytics-muted">Render {item.averageRenderMs||0} ms · Stay {Math.round((item.averageDurationMs||0)/1000)} sec</small></span><b>{item.samples+item.durationSamples}</b></div>)}{!data.slowPages.length&&<p className="analytics-muted">No performance samples yet.</p>}</section></div>
        <section className="admin-card"><span className="admin-eyebrow">TOP PAGES</span><h2>All recorded pages</h2><p className="analytics-muted">Every path that generated a page-view event is included here, not only admin routes.</p><div className="analytics-table"><table><thead><tr><th>Page</th><th>Visits</th></tr></thead><tbody>{data.topPages.map((item)=><tr key={item.path}><td><code>{item.path}</code></td><td>{item.visits}</td></tr>)}</tbody></table></div></section>
        <section className="admin-card"><div className="admin-card-head"><div><span className="admin-eyebrow">VISITOR DIRECTORY</span><h2>Recent visitors</h2></div><input className="analytics-filter" value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search IP, city or country" aria-label="Search visitors"/></div><p className="analytics-muted">Select any visitor to inspect the complete page-by-page history.</p><div className="analytics-table"><table><thead><tr><th>IP address</th><th>City</th><th>Country</th><th>Visits</th><th>Last seen</th><th>History</th></tr></thead><tbody>{visitors.map((item)=><tr key={item.visitorId}><td><code>{item.ipAddress}</code></td><td>{item.city}</td><td>{item.country}</td><td>{item.visits}</td><td>{item.lastSeen?new Date(item.lastSeen).toLocaleString():'—'}</td><td><button className="admin-secondary" onClick={()=>openHistory(item.visitorId)} disabled={historyLoading}>View history</button></td></tr>)}{!visitors.length&&<tr><td colSpan={6}>No visitor details yet.</td></tr>}</tbody></table></div></section>
        <section className="admin-card"><span className="admin-eyebrow">SECURITY CONTROL</span><h2>Block visitor IP</h2><p className="analytics-muted">Blocked IPs are denied by the application access guard and can be removed here.</p><div className="analytics-form"><label>IP address<input value={ip} onChange={(event)=>setIp(event.target.value)} placeholder="203.0.113.10"/></label><label>Reason<input value={reason} onChange={(event)=>setReason(event.target.value)} placeholder="Spam or abuse"/></label><button className="admin-primary" disabled={busy||!ip.trim()} onClick={block}>Block IP</button></div><div className="analytics-table"><table><thead><tr><th>IP address</th><th>Reason</th><th>Created</th><th></th></tr></thead><tbody>{data.blocked.map((item)=><tr key={item.id}><td><code>{item.ip_address}</code></td><td>{item.reason||'—'}</td><td>{new Date(item.created_at).toLocaleString()}</td><td><button className="admin-secondary" disabled={busy} onClick={()=>unblock(item.id)}>Unblock</button></td></tr>)}{!data.blocked.length&&<tr><td colSpan={4}>No blocked IPs.</td></tr>}</tbody></table></div></section>
      </>}
    </div>
    {history && <div className="analytics-modal-backdrop" role="presentation" onClick={()=>setHistory(null)}><section className="analytics-modal" role="dialog" aria-modal="true" aria-label="Visitor history" onClick={(event)=>event.stopPropagation()}><div className="analytics-modal-head"><div><span className="admin-eyebrow">VISITOR HISTORY</span><h2>{history.visitorId}</h2><p className="analytics-muted">Complete recorded activity for this visitor.</p></div><button className="admin-secondary" onClick={()=>setHistory(null)}>Close</button></div>{history.events.map((event,index)=><div className="analytics-event" key={`${event.created_at}-${index}`}><strong>{event.created_at?new Date(event.created_at).toLocaleString():'Unknown time'}</strong><div><b>{event.event_name||'event'}</b><br/><code>{event.path||'/'}</code><p className="analytics-muted">{event.city||'Unknown city'}, {event.country||'Unknown country'} · IP {event.ip_address||'unknown'}</p>{event.metadata&&<small>{JSON.stringify(event.metadata)}</small>}</div></div>)}{!history.events.length&&<p>No history found.</p>}</section></div>}
  </main>;
}
