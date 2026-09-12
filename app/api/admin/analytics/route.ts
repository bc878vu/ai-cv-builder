import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ message: 'Admin authentication required.' }, { status: 401 }); }
  const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key) return NextResponse.json({ message: 'Analytics database access is not configured.' }, { status: 503 });

  try {
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const response = await fetch(`${base}/rest/v1/analytics_events?select=event_name,visitor_id,path,created_at,ip_address,city,country,user_agent&created_at=gte.${encodeURIComponent(since)}&order=created_at.asc&limit=20000`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' });
    if (!response.ok) return NextResponse.json({ message: 'Unable to load analytics.' }, { status: 500 });
    const events = await response.json() as Array<{ event_name?:string; visitor_id?:string; path?:string; created_at?:string; ip_address?:string; city?:string; country?:string; user_agent?:string }>;
    const daily: Array<{date:string;visits:number;uniqueVisitors:number;sessions:number;accounts:number;cvs:number;exports:number}> = [];
    const totals = { visits:0, uniqueVisitors:0, sessions:0, accounts:0, cvs:0, exports:0 };
    const visitors = new Set<string>();
    for (let i=29;i>=0;i-=1) {
      const date = new Date(); date.setHours(0,0,0,0); date.setDate(date.getDate()-i);
      const day = date.toISOString().slice(0,10); const item = {date, visits:0, uniqueVisitors:0, sessions:0, accounts:0, cvs:0, exports:0};
      const dayVisitors = new Set<string>();
      for (const event of events) if (String(event.created_at||'').slice(0,10)===day) {
        if(event.event_name==='page_view'){item.visits+=1;if(event.visitor_id){dayVisitors.add(event.visitor_id);visitors.add(event.visitor_id);}}
        if(event.event_name==='session_start')item.sessions+=1;
        if(event.event_name==='account_created')item.accounts+=1;
        if(event.event_name==='cv_created')item.cvs+=1;
        if(event.event_name==='cv_exported')item.exports+=1;
      }
      item.uniqueVisitors=dayVisitors.size; daily.push({...item,date:day});
    }
    totals.visits=daily.reduce((s,x)=>s+x.visits,0); totals.uniqueVisitors=visitors.size; totals.sessions=daily.reduce((s,x)=>s+x.sessions,0); totals.accounts=daily.reduce((s,x)=>s+x.accounts,0); totals.cvs=daily.reduce((s,x)=>s+x.cvs,0); totals.exports=daily.reduce((s,x)=>s+x.exports,0);
    const pageCounts:Record<string,number>={}; const countryCounts:Record<string,number>={}; const cityCounts:Record<string,number>={}; const visitorMap=new Map<string,{visitorId:string;ipAddress:string;city:string;country:string;lastSeen:string;visits:number}>();
    for(const event of events){
      if(event.event_name==='page_view'&&event.path)pageCounts[event.path]=(pageCounts[event.path]||0)+1;
      if(event.event_name==='page_view'&&event.country)countryCounts[event.country]=(countryCounts[event.country]||0)+1;
      if(event.event_name==='page_view'&&event.city)cityCounts[event.city]=(cityCounts[event.city]||0)+1;
      if(event.visitor_id){const current=visitorMap.get(event.visitor_id); if(!current||String(event.created_at||'')>current.lastSeen)visitorMap.set(event.visitor_id,{visitorId:event.visitor_id,ipAddress:event.ip_address||'unknown',city:event.city||'Unknown',country:event.country||'Unknown',lastSeen:event.created_at||'',visits:(current?.visits||0)+(event.event_name==='page_view'?1:0)});}
    }
    const topPages=Object.entries(pageCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([path,visits])=>({path,visits}));
    const countries=Object.entries(countryCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([country,visits])=>({country,visits}));
    const cities=Object.entries(cityCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([city,visits])=>({city,visits}));
    const visitorsList=Array.from(visitorMap.values()).sort((a,b)=>b.lastSeen.localeCompare(a.lastSeen)).slice(0,100);
    const blockedResponse=await fetch(`${base}/rest/v1/blocked_ips?select=id,ip_address,reason,created_at&order=created_at.desc&limit=200`,{headers:{apikey:key,Authorization:`Bearer ${key}`},cache:'no-store'});
    const blocked=blockedResponse.ok?await blockedResponse.json():[];
    return NextResponse.json({range:'30d',totals,daily,topPages,countries,cities,visitors:visitorsList,blocked});
  } catch { return NextResponse.json({ message: 'Unable to load analytics.' }, { status: 500 }); }
}
