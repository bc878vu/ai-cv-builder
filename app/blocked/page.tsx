import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function BlockedPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f8fafc' }}>
      <section style={{ width: 'min(100%, 560px)', textAlign: 'center', padding: 40, border: '1px solid #e2e8f0', borderRadius: 24, background: '#fff', boxShadow: '0 18px 60px rgba(15,23,42,.08)' }}>
        <div style={{ width: 64, height: 64, margin: '0 auto 20px', display: 'grid', placeItems: 'center', borderRadius: 20, background: '#fee2e2', color: '#b91c1c', fontSize: 30 }}>!</div>
        <p style={{ margin: 0, color: '#dc2626', fontWeight: 800, letterSpacing: '.12em', fontSize: 12 }}>ACCESS RESTRICTED</p>
        <h1 style={{ margin: '12px 0', fontSize: 'clamp(28px, 5vw, 42px)', color: '#0f172a' }}>Access blocked</h1>
        <p style={{ margin: 0, color: '#64748b', lineHeight: 1.7 }}>Your IP address has been blocked by the app team. If you believe this is a mistake, please contact the app administrator.</p>
        <Link href="/contact" style={{ display: 'inline-block', marginTop: 24, padding: '12px 18px', borderRadius: 12, background: '#4f46e5', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Contact app team</Link>
      </section>
    </main>
  );
}
