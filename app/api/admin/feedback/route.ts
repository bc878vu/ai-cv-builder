import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../admin-auth';
export const dynamic='force-dynamic';
const base=()=>`${(process.env.SUPABASE_URL||'https://bewxefxjbvbumajflhfw.supabase.co').replace(/\/$/,'')}/rest/v1/feedback`;
const key=()=>process.env.SUPABASE_SERVICE_ROLE_KEY||'';
const headers=()=>({apikey:key(),Authorization:`Bearer ${key()}`,'Content-Type':'application/json'});
async function guard(){try{await requireAdmin();return true}catch{return false}}
function err(message:string,status:number){return NextResponse.json({message},{status})}
export async function GET(){if(!await guard())return err('Admin authentication required.',401);if(!key())return err('Admin database access is not configured. Add SUPABASE_SERVICE_ROLE_KEY.',503);try{const r=await fetch(`${base()}?select=*&order=created_at.desc&limit=500`,{headers:headers(),cache:'no-store'});if(!r.ok)return err('Unable to load feedback.',500);return NextResponse.json({items:await r.json()},{headers:{'Cache-Control':'no-store'}})}catch{return err('Unable to load feedback.',500)}}
export async function POST(request:Request){if(!await guard())return err('Admin authentication required.',401);if(!key())return err('Admin database access is not configured. Add SUPABASE_SERVICE_ROLE_KEY.',503);const b=await request.json().catch(()=>null) as Record<string,unknown>|null;const name=String(b?.name??'').trim().slice(0,60),review=String(b?.review??'').trim().slice(0,1000),rating=Number(b?.rating);if(!name||!review||!Number.isInteger(rating)||rating<1||rating>5)return err('Invalid feedback fields.',400);try{const r=await fetch(base(),{method:'POST',headers:{...headers(),Prefer:'return=representation'},body:JSON.stringify({name,review,rating})});if(!r.ok)return err('Unable to create feedback.',400);return NextResponse.json({item:(await r.json())[0]})}catch{return err('Unable to create feedback.',500)}}
