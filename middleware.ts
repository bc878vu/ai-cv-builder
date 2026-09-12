import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.headers.get('x-vercel-forwarded-for') || '';
  return forwarded.split(',')[0].trim();
}

async function isBlocked(ip: string) {
  if (!ip || !SUPABASE_URL || !SERVICE_KEY) return false;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/blocked_ips?select=id&ip_address=eq.${encodeURIComponent(ip)}&limit=1`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      cache: 'no-store',
    });
    if (!response.ok) return false;
    const rows = await response.json();
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === '/blocked' || pathname.startsWith('/_next/') || pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }

  const ip = getClientIp(request);
  if (await isBlocked(ip)) {
    const url = request.nextUrl.clone();
    url.pathname = '/blocked';
    url.search = '';
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map|woff2?)$).*)'],
};
