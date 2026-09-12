'use client';

import { useEffect, useMemo, useState } from 'react';

type Daily = { date: string; visits: number; uniqueVisitors: number; sessions: number; accounts: number; cvs: number; exports: number };
type Analytics = { range: string; totals: { visits: number; uniqueVisitors: number; sessions: number; accounts: number; cvs: number; exports: number }; daily: Daily[]; topPages: { path: string; visits: number }[] };

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/analytics', { cache: 'no-store' });
      const payload = await response.json();
      if (response.status === 401) { window.location.href = '/admin/login'; return; }
      if (!response.ok) throw new Error(payload.message || 'Analytics unavailable.');
      setData(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Analytics unavailable.');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  const maxVisits = useMemo(() => Math.max(1, ...(data?.daily || []).map(item => item.visits)), [data]);

  return <main className="admin-shell admin-analytics-page">
    <section className="admin-main">
      <header className="admin-top"><div><span className="admin-eyebrow">ADMIN ANALYTICS</span><h1>Visitors & Growth</h1><p>Privacy-conscious aggregate activity for the last 30 days.</p></div><button className="admin-secondary" onClick={load}>Refresh</button></header>
      {loading && <section className="admin-card"><p>Loading analytics…</p></section>}
      {error && <section className="admin-card"><p className="admin-error">{error}</p><p>Check the Supabase service-role environment variable and redeploy.</p></section>}
      {data && <>
        <div className="admin-stats">
          {Object.entries({ Visits: data.totals.visits, 'Unique visitors': data.totals.uniqueVisitors, Sessions: data.totals.sessions, Accounts: data.totals.accounts, 'CVs created': data.totals.cvs, Exports: data.totals.exports }).map(([label, value]) => <article key={label}><strong>{value.toLocaleString()}</strong><span>{label}</span></article>)}
        </div>
        <section className="admin-card"><div className="admin-card-head"><div><span className="admin-eyebrow">TRAFFIC TREND</span><h2>Daily visits</h2></div><span>{data.range}</span></div><div className="analytics-bars" aria-label="Daily visits bar chart">{data.daily.map(item => <div className="analytics-bar-item" key={item.date} title={`${item.date}: ${item.visits} visits`}><div className="analytics-bar" style={{ height: `${Math.max(3, item.visits / maxVisits * 100)}%` }} /><small>{item.date.slice(5)}</small></div>)}</div></section>
        <section className="admin-card"><span className="admin-eyebrow">TOP PAGES</span><h2>Most visited pages</h2><div className="admin-table-wrap"><table><thead><tr><th>Page</th><th>Visits</th></tr></thead><tbody>{data.topPages.map(page => <tr key={page.path}><td><code>{page.path}</code></td><td>{page.visits.toLocaleString()}</td></tr>)}{!data.topPages.length && <tr><td colSpan={2}>No visits recorded yet.</td></tr>}</tbody></table></div></section>
      </>}
    </section>
  </main>;
}
