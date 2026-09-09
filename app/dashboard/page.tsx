'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import './dashboard.css';

type SavedCV = { id: string; name: string; role: string; updatedAt: string };
const KEY = 'ai-cv-builder-cvs';

export default function Dashboard() {
  const router = useRouter();
  const [cvs, setCvs] = useState<SavedCV[]>([]);
  useEffect(() => { try { setCvs(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {} }, []);
  function createCV() { const id = `cv-${Date.now()}`; const next = [...cvs, { id, name: 'Untitled CV', role: 'Professional Title', updatedAt: new Date().toISOString() }]; localStorage.setItem(KEY, JSON.stringify(next)); setCvs(next); router.push(`/?cv=${id}`); }
  function remove(id: string) { const next = cvs.filter(c => c.id !== id); localStorage.setItem(KEY, JSON.stringify(next)); localStorage.removeItem(`ai-cv-builder-${id}`); setCvs(next); }
  return <main className="dashboard"><header className="dashboard-head"><div className="dash-brand"><div className="logo">CV</div><div><strong>AI CV Builder</strong><span>My CVs</span></div></div><button className="primary dash-new" onClick={createCV}><Plus size={16}/> Create new CV</button></header><section className="dash-content"><div className="dash-intro"><div><div className="eyebrow"><Sparkles size={14}/> WORKSPACE</div><h1>My CVs</h1><p>Create multiple tailored CVs for different jobs, roles and industries.</p></div><span className="count">{cvs.length} CV{cvs.length === 1 ? '' : 's'}</span></div>{cvs.length === 0 ? <div className="empty"><FileText size={34}/><h2>No CVs yet</h2><p>Create your first CV and start customizing it with templates and AI.</p><button className="primary" onClick={createCV}><Plus size={16}/> Create my first CV</button></div> : <div className="cv-grid">{cvs.map(cv => <article className="cv-card" key={cv.id}><div className="cv-thumb"><div></div><i></i><i></i><i></i></div><div className="cv-info"><strong>{cv.name || 'Untitled CV'}</strong><span>{cv.role || 'Professional Title'}</span><small>Updated {new Date(cv.updatedAt).toLocaleDateString()}</small></div><div className="cv-actions"><button onClick={() => router.push(`/?cv=${cv.id}`)} className="open">Open <ArrowRight size={15}/></button><button onClick={() => remove(cv.id)} className="delete" aria-label="Delete CV"><Trash2 size={15}/></button></div></article>)}</div>}</section></main>;
}
