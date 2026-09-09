'use client';

import { useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#eef2f7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <section style={{ width: '100%', maxWidth: 520, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 32, textAlign: 'center', boxShadow: '0 18px 50px rgba(17,24,39,.08)' }}>
        <div style={{ width: 52, height: 52, margin: '0 auto 16px', borderRadius: 14, display: 'grid', placeItems: 'center', background: '#fef2f2', color: '#dc2626' }}><AlertTriangle size={24} /></div>
        <h1 style={{ margin: '0 0 8px', fontSize: 24 }}>Something went wrong</h1>
        <p style={{ margin: '0 auto 22px', color: '#6b7280', lineHeight: 1.6 }}>Your CV data is stored locally in this browser. Try again, and if the problem continues, reload the page.</p>
        <button onClick={() => reset()} style={{ border: 0, borderRadius: 10, padding: '10px 16px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><RotateCcw size={16} /> Try again</button>
      </section>
    </main>
  );
}
