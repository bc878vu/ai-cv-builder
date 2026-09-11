import { NextResponse } from 'next/server';
import { getSiteContent } from '../../site-content';
export const dynamic='force-dynamic';
export async function GET(request:Request){const page=new URL(request.url).searchParams.get('page')||'/';return NextResponse.json({content:await getSiteContent(page)},{headers:{'Cache-Control':'no-store'}})}
