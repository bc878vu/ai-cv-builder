import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE='ai_cv_admin_session';
const TTL=8*60*60*1000;

function secret(){return process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_PASSWORD||'configure-admin-session-secret'}
function sign(value:string){return createHmac('sha256',secret()).update(value).digest('hex')}
function token(){const value=String(Date.now());return `${value}.${sign(value)}`}
function valid(value?:string){if(!value)return false;const [stamp,sig]=value.split('.');if(!stamp||!sig)return false;const expected=sign(stamp);if(sig.length!==expected.length)return false;try{return Date.now()-Number(stamp)<TTL&&timingSafeEqual(Buffer.from(sig),Buffer.from(expected))}catch{return false}}

export async function isAdmin(){return valid((await cookies()).get(COOKIE)?.value)}
export async function requireAdmin(){if(!await isAdmin())throw new Error('UNAUTHORIZED_ADMIN')}
export async function startAdminSession(){const store=await cookies();store.set(COOKIE,token(),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:TTL/1000})}
export async function endAdminSession(){(await cookies()).delete(COOKIE)}
export function checkAdminPassword(password:string){const configured=process.env.ADMIN_PASSWORD;return Boolean(configured&&password&&password===configured)}
export const ADMIN_COOKIE=COOKIE;
