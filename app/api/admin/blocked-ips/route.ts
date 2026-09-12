import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../admin-auth';

export const dynamic = 'force-dynamic';
const base = () => (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function guard() { try { await requireAdmin(); return true; } catch { return false; } }

export async function POST(request: Request) {
  if (!await guard()) return NextResponse.json({ message: 'Admin authentication required.' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const ip_address = String(body?.ip_address || '').trim().slice(0, 64);
  const reason = String(body?.reason || '').trim().slice(0, 300);
  if (!ip_address || ip_address.length < 3) return NextResponse.json({ message: 'Enter a valid IP address.' }, { status: 400 });
  if (!base() || !key()) return NextResponse.json({ message: 'Database access is not configured.' }, { status: 503 });
  const response = await fetch(`${base()}/rest/v1/blocked_ips`, { method: 'POST', headers: { apikey: key(), Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify({ ip_address, reason }) });
  if (!response.ok) return NextResponse.json({ message: response.status === 409 ? 'This IP is already blocked.' : 'Unable to block IP.' }, { status: response.status === 409 ? 409 : 500 });
  return NextResponse.json((await response.json())[0] || { ip_address, reason });
}

export async function DELETE(request: Request) {
  if (!await guard()) return NextResponse.json({ message: 'Admin authentication required.' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = String(body?.id || '');
  if (!id || !base() || !key()) return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  const response = await fetch(`${base()}/rest/v1/blocked_ips?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers: { apikey: key(), Authorization: `Bearer ${key()}` } });
  if (!response.ok) return NextResponse.json({ message: 'Unable to unblock IP.' }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
