'use client';

import { useEffect } from 'react';

function getVisitorId() {
  const key = 'ai-cv-analytics-visitor';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = String(crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random());
  window.localStorage.setItem(key, id);
  return id;
}

export default function AnalyticsTracker() {
  useEffect(() => {
    const visitor_id = getVisitorId();
    const path = (window.location.pathname + window.location.search).slice(0, 300);
    const startedAt = Date.now();
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const render_ms = navigation ? Math.max(0, Math.round(navigation.domContentLoadedEventEnd || navigation.responseEnd || 0)) : undefined;
    const send = (event_name: 'page_view' | 'session_start' | 'page_exit', metadata: Record<string, number | string> = {}) => {
      void fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_name, visitor_id, path, metadata }),
        keepalive: true,
      }).catch(() => undefined);
    };
    send('page_view', { ...(render_ms === undefined ? {} : { render_ms }), referrer: document.referrer.slice(0, 200) });
    const sessionKey = 'ai-cv-analytics-session';
    if (!window.sessionStorage.getItem(sessionKey)) {
      window.sessionStorage.setItem(sessionKey, '1');
      send('session_start');
    }
    const exit = () => send('page_exit', { duration_ms: Math.max(0, Date.now() - startedAt) });
    window.addEventListener('pagehide', exit, { once: true });
    return () => window.removeEventListener('pagehide', exit);
  }, []);
  return null;
}
