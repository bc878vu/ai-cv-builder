import { NextResponse } from 'next/server';
import { checkAdminPassword, endAdminSession, isAdmin, startAdminSession } from '../../../admin-auth';

export const dynamic='force-dynamic';
let attempts=new Map<string,{count:number;reset:number}>();
function allowed(ip:string){const now=Date.now(),b=attempts.get(ip);if(!b||b.reset<now){attempts.set(ip,{count:1,reset:now+15*60*1000});return true}if(b.count>=8)return false;b.count++;return true}

export async function GET(){return NextResponse.json({authenticated:await isAdmin()},{headers:{'Cache-Control':'no-store'}})}
export async function POST(request:Request){
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
 if(!allowed(ip))return NextResponse.json({message:'Too many login attempts. Try again later.'},{status:429});
 const body=await request.json().catch(()=>null) as {password?:unknown}|null;
 if(!checkAdminPassword(String(body?.password??'')))return NextResponse.json({message:'Invalid admin credentials.'},{status:401});
 await startAdminSession();return NextResponse.json({ok:true});
}
export async function DELETE(){await endAdminSession();return NextResponse.json({ok:true});}
