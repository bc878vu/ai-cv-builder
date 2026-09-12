'use client';

import { useEffect } from 'react';

function getVisitorId() {
  const key = 'ai-cv-analytics-visitor';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = `${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;
  window.localStorage.setItem(key, id);
  return id;
}

export default function AnalyticsTracker() {
  useEffect(() => {
    const visitor_id = getVisitorId();
    const path = `${window.location.pathname}${window.location.search}`.slice(0, 300);
    const send = (event_name: 'page_view' | 'session_start') => {
      void fetch('/api/analytics/track', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_name, visitor_id, path }), keepalive: true,
      }).catch(() => undefined);
    };
    send('page_view');
    const sessionKey = 'ai-cv-analytics-session';
    if (!window.sessionStorage.getItem(sessionKey)) {
      window.sessionStorage.setItem(sessionKey, '1');
      send('session_start');
    }
  }, []);
  return null;
}
