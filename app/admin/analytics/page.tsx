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

  return <main className="admin-main admin-analytics-page">
    <style jsx global>{`
      .admin-analytics-page { min-width: 0; width: 100%; box-sizing: border-box; }
      .admin-analytics-page .admin-top { max-width: 1180px; margin-inline: auto; }
      .admin-analytics-page .analytics-content { width: 100%; max-width: 1180px; margin: 0 auto; display: grid; gap: 18px; }
      .admin-analytics-page .admin-stats { grid-template-columns: repeat(6, minmax(0, 1fr)); }
      .admin-analytics-page .admin-stats article { min-width: 0; }
      .admin-analytics-page .admin-stats strong { overflow-wrap: anywhere; }
      .admin-analytics-page .analytics-bars { display: grid; grid-template-columns: repeat(30, minmax(8px, 1fr)); align-items: end; gap: 7px; min-height: 230px; padding: 22px 8px 0; border-bottom: 1px solid #e2e8f0; }
      .admin-analytics-page .analytics-bar-item { min-width: 0; height: 205px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 8px; }
      .admin-analytics-page .analytics-bar { width: 100%; max-width: 24px; min-height: 4px; border-radius: 7px 7px 2px 2px; background: linear-gradient(180deg, #6366f1, #818cf8); transition: height .2s ease; }
      .admin-analytics-page .analytics-bar-item small { color: #94a3b8; font-size: 9px; writing-mode: vertical-rl; transform: rotate(180deg); }
      .admin-analytics-page .analytics-note { color: #64748b; font-size: 12px; line-height: 1.6; }
      .admin-analytics-page .admin-card h2 { margin: 7px 0 0; font-size: 20px; letter-spacing: -.02em; }
      @media (max-width: 1100px) { .admin-analytics-page .admin-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      @media (max-width: 700px) { .admin-analytics-page { padding: 15px; } .admin-analytics-page .admin-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .admin-analytics-page .analytics-bars { gap: 3px; min-height: 180px; padding-inline: 0; } .admin-analytics-page .analytics-bar-item { height: 155px; } .admin-analytics-page .analytics-bar-item small { font-size: 8px; } }
      @media (prefers-reduced-motion: reduce) { .admin-analytics-page .analytics-bar { transition: none; } }
    `}</style>
    <header className="admin-top"><div><span className="admin-eyebrow">ADMIN ANALYTICS</span><h1>Visitors &amp; Growth</h1><p className="analytics-note">Privacy-conscious aggregate activity for the last 30 days.</p></div><button className="admin-secondary" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button></header>
    <div className="analytics-content">
      {loading && <section className="admin-card"><p>Loading analytics…</p></section>}
      {error && <section className="admin-card"><p className="admin-error">{error}</p><p className="analytics-note">Check the Supabase service-role environment variable and redeploy.</p></section>}
      {data && <>
        <div className="admin-stats">
          {Object.entries({ Visits: data.totals.visits, 'Unique visitors': data.totals.uniqueVisitors, Sessions: data.totals.sessions, Accounts: data.totals.accounts, 'CVs created': data.totals.cvs, Exports: data.totals.exports }).map(([label, value]) => <article key={label}><strong>{value.toLocaleString()}</strong><span>{label}</span></article>)}
        </div>
        <section className="admin-card"><div className="admin-card-head"><div><span className="admin-eyebrow">TRAFFIC TREND</span><h2>Daily visits</h2></div><span>{data.range}</span></div><div className="analytics-bars" aria-label="Daily visits bar chart">{data.daily.map(item => <div className="analytics-bar-item" key={item.date} title={`${item.date}: ${item.visits} visits`}><div className="analytics-bar" style={{ height: `${Math.max(3, item.visits / maxVisits * 100)}%` }} /><small>{item.date.slice(5)}</small></div>)}</div></section>
        <section className="admin-card"><span className="admin-eyebrow">TOP PAGES</span><h2>Most visited pages</h2><div className="admin-table-wrap"><table><thead><tr><th>Page</th><th>Visits</th></tr></thead><tbody>{data.topPages.map(page => <tr key={page.path}><td><code>{page.path}</code></td><td>{page.visits.toLocaleString()}</td></tr>)}{!data.topPages.length && <tr><td colSpan={2}>No visits recorded yet.</td></tr>}</tbody></table></div></section>
      </>}
    </div>
  </main>;
}
