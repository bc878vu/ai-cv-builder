'use client';

import { useMemo, useState } from 'react';
import { WandSparkles, Plus, Download, FileText, LayoutTemplate, Sparkles, CheckCircle2 } from 'lucide-react';

type CV = {
  name: string;
  role: string;
  summary: string;
  experience: string[];
  skills: string[];
  education: string[];
};

type Template = { id: string; name: string; description: string; accent: string };

const templates: Template[] = [
  { id: 'professional', name: 'Professional', description: 'Clean structure for business and corporate roles.', accent: '#1d4ed8' },
  { id: 'modern', name: 'Modern', description: 'Strong typography and balanced visual hierarchy.', accent: '#0f766e' },
  { id: 'minimal', name: 'Minimal', description: 'Simple ATS-first design with elegant spacing.', accent: '#111827' },
  { id: 'creative', name: 'Creative', description: 'More personality for design, marketing and media.', accent: '#7c3aed' },
  { id: 'executive', name: 'Executive', description: 'Premium layout for senior leadership profiles.', accent: '#9a3412' },
  { id: 'developer', name: 'Developer', description: 'Technical hierarchy for engineering and product.', accent: '#0369a1' },
  { id: 'graduate', name: 'Fresh Graduate', description: 'Education and projects-forward graduate CV.', accent: '#15803d' },
  { id: 'ats', name: 'ATS Friendly', description: 'Plain, readable structure optimized for parsing.', accent: '#374151' },
];

const starter: CV = {
  name: 'Muhammad Ahmed',
  role: 'Frontend Developer',
  summary: 'Frontend developer focused on building reliable, accessible and high-performance web experiences with React and Next.js.',
  experience: ['Built responsive React interfaces used across customer-facing workflows.', 'Improved frontend performance, reusable components and accessibility standards.'],
  skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS'],
  education: ['BS Computer Science — University of Lahore'],
};

export default function Home() {
  const [cv, setCv] = useState<CV>(starter);
  const [template, setTemplate] = useState('professional');
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'ai'>('editor');
  const [jd, setJd] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [busy, setBusy] = useState(false);

  const selected = useMemo(() => templates.find((item) => item.id === template) ?? templates[0], [template]);

  async function askAI(action: 'summary' | 'experience' | 'ats') {
    setBusy(true);
    setAiOutput('Generating suggestions…');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, cv, jobDescription: jd }),
      });
      const data = await res.json();
      setAiOutput(data.text || data.error || 'No suggestion returned.');
    } catch {
      setAiOutput('AI service is not configured yet. Add OPENAI_API_KEY on the server to enable generation.');
    } finally { setBusy(false); }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><div className="logo">CV</div><div><strong>AI CV Builder</strong><span>Professional CVs, powered by AI</span></div></div>
        <div className="top-actions"><button className="ghost"><Plus size={16}/> New CV</button><button className="primary"><Download size={16}/> Export PDF</button></div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <div className="tabs">
            <button onClick={() => setActiveTab('editor')} className={activeTab === 'editor' ? 'active' : ''}><FileText size={16}/> Editor</button>
            <button onClick={() => setActiveTab('templates')} className={activeTab === 'templates' ? 'active' : ''}><LayoutTemplate size={16}/> Templates</button>
            <button onClick={() => setActiveTab('ai')} className={activeTab === 'ai' ? 'active' : ''}><Sparkles size={16}/> AI Assistant</button>
          </div>

          {activeTab === 'editor' && <div className="panel">
            <label>Full name<input value={cv.name} onChange={e => setCv({...cv, name: e.target.value})}/></label>
            <label>Professional title<input value={cv.role} onChange={e => setCv({...cv, role: e.target.value})}/></label>
            <label>Professional summary<textarea rows={5} value={cv.summary} onChange={e => setCv({...cv, summary: e.target.value})}/></label>
            <label>Skills<input value={cv.skills.join(', ')} onChange={e => setCv({...cv, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}/></label>
            <label>Education<textarea rows={3} value={cv.education.join('\n')} onChange={e => setCv({...cv, education: e.target.value.split('\n').filter(Boolean)})}/></label>
          </div>}

          {activeTab === 'templates' && <div className="template-grid">{templates.map(t => <button key={t.id} className={`template-card ${template === t.id ? 'selected' : ''}`} onClick={() => setTemplate(t.id)}><div className="mini-preview" style={{'--accent': t.accent} as React.CSSProperties}><div></div><i></i><i></i><i></i></div><strong>{t.name}</strong><span>{t.description}</span>{template === t.id && <CheckCircle2 size={15}/>}</button>)}<button className="template-card custom"><div className="custom-icon">＋</div><strong>Build your template</strong><span>1 or 2 columns, colors, fonts, spacing and sections.</span></button></div>}

          {activeTab === 'ai' && <div className="panel ai-panel">
            <div className="ai-box"><WandSparkles size={18}/><div><strong>AI CV Assistant</strong><span>Improve wording without inventing experience.</span></div></div>
            <button onClick={() => askAI('summary')} disabled={busy} className="ai-btn">Improve summary</button>
            <button onClick={() => askAI('experience')} disabled={busy} className="ai-btn">Rewrite experience bullets</button>
            <label>Paste job description<textarea rows={8} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste a job description to identify relevant keywords…"/></label>
            <button onClick={() => askAI('ats')} disabled={busy} className="ai-btn primary-ai">Analyze ATS match</button>
            <pre className="ai-result">{aiOutput || 'AI suggestions will appear here.'}</pre>
          </div>}
        </aside>

        <section className="preview-area">
          <div className="preview-toolbar"><div><span className="pill">A4</span><span className="muted">{selected.name} template</span></div><div><span className="muted">Live preview</span><button className="ghost">Print</button></div></div>
          <div className="paper-wrap"><article className="paper" style={{'--accent': selected.accent} as React.CSSProperties}>
            <div className="resume-head"><div><h1>{cv.name}</h1><h2>{cv.role}</h2><p className="contact">Lahore, Pakistan · +92 300 0000000 · example@email.com</p></div><div className="avatar">MA</div></div>
            <ResumeSection title="PROFILE"><p>{cv.summary}</p></ResumeSection>
            <ResumeSection title="EXPERIENCE"><div className="timeline"><strong>Frontend Developer · Digital Studio</strong><span>2023 — Present</span>{cv.experience.map((item, i) => <p key={i}>• {item}</p>)}</div></ResumeSection>
            <ResumeSection title="SKILLS"><div className="chips">{cv.skills.map(s => <span key={s}>{s}</span>)}</div></ResumeSection>
            <ResumeSection title="EDUCATION">{cv.education.map((e, i) => <p key={i}>{e}</p>)}</ResumeSection>
          </article></div>
        </section>
      </section>
    </main>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="resume-section"><h3>{title}</h3>{children}</section>;
}
