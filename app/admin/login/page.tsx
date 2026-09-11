'use client';
import { FormEvent, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import '../admin.css';

export default function AdminLogin(){const router=useRouter();const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function submit(e:FormEvent){e.preventDefault();if(busy)return;setBusy(true);setError('');try{const r=await fetch('/api/admin/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const d=await r.json().catch(()=>({}));if(!r.ok){setError(d.message||'Login failed.');return}router.replace('/admin/panel');router.refresh()}catch{setError('Unable to reach the admin service.')}finally{setBusy(false)}}
 return <main className="admin-login"><form className="admin-login-card" onSubmit={submit}><div className="admin-mark"><ShieldCheck size={28}/></div><span className="admin-eyebrow">SECURE ADMIN</span><h1>AI CV Builder</h1><p>Sign in to manage pages, content, reviews and site data.</p><label>Admin password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required autoFocus/></label><button className="admin-primary" disabled={busy}><LockKeyhole size={16}/>{busy?'Checking…':'Sign in'}</button>{error&&<div className="admin-error">{error}</div>}<small>Admin access is server-protected. No password is stored in the browser.</small></form></main>}
