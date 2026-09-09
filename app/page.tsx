'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, FileText, LayoutTemplate, Plus, Save, Sparkles, WandSparkles, Palette, Settings2, Trash2, GripVertical, Printer, FolderOpen, Check, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

type SectionKey = 'profile' | 'experience' | 'education' | 'skills' | 'projects';
type CV = { id: string; name: string; role: string; email: string; phone: string; location: string; summary: string; experience: string[]; education: string[]; skills: string[]; projects: string[] };
type Design = { accent: string; font: string; size: number; spacing: number; columns: 1 | 2; radius: number; showAvatar: boolean };
type Template = { id: string; name: string; description: string; accent: string; columns: 1 | 2 };
type SavedCV = { id: string; name: string; role: string; updatedAt: string };
type AIAction = 'summary' | 'experience' | 'ats';

const CV_INDEX_KEY = 'ai-cv-builder-cvs';
const LEGACY_DRAFT_KEY = 'ai-cv-builder-draft';

const templates: Template[] = [
  { id: 'professional', name: 'Professional', description: 'Clean corporate hierarchy.', accent: '#1d4ed8', columns: 1 },
  { id: 'modern', name: 'Modern', description: 'Strong typography and balance.', accent: '#0f766e', columns: 2 },
  { id: 'minimal', name: 'Minimal', description: 'Simple ATS-first design.', accent: '#111827', columns: 1 },
  { id: 'creative', name: 'Creative', description: 'Visual personality for creative roles.', accent: '#7c3aed', columns: 2 },
  { id: 'executive', name: 'Executive', description: 'Premium senior profile.', accent: '#9a3412', columns: 1 },
  { id: 'developer', name: 'Developer', description: 'Technical portfolio hierarchy.', accent: '#0369a1', columns: 2 },
  { id: 'graduate', name: 'Fresh Graduate', description: 'Projects and education first.', accent: '#15803d', columns: 1 },
  { id: 'ats', name: 'ATS Friendly', description: 'Parser-friendly structure.', accent: '#374151', columns: 1 },
];

const starter: CV = { id: 'cv-1', name: 'Muhammad Ahmed', role: 'Frontend Developer', email: 'example@email.com', phone: '+92 300 0000000', location: 'Lahore, Pakistan', summary: 'Frontend developer focused on building reliable, accessible and high-performance web experiences with React and Next.js.', experience: ['Built responsive React interfaces used across customer-facing workflows.', 'Improved frontend performance, reusable components and accessibility standards.'], education: ['BS Computer Science — University of Lahore'], skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS'], projects: ['AI CV Builder — designed a template-driven resume editor with AI assistance.'] };
const defaultDesign: Design = { accent: '#1d4ed8', font: 'Inter', size: 11, spacing: 1, columns: 1, radius: 6, showAvatar: true };
const defaultSectionOrder: SectionKey[] = ['profile', 'experience', 'projects', 'skills', 'education'];
const sectionLabels: Record<SectionKey, string> = { profile: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills', projects: 'Projects' };

function blankCV(id: string): CV { return { ...starter, id, name: '', role: '', summary: '', experience: [], education: [], skills: [], projects: [] }; }
function readIndex(): SavedCV[] { try { return JSON.parse(localStorage.getItem(CV_INDEX_KEY) || '[]'); } catch { return []; } }

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get('cv');
  const [cv, setCv] = useState<CV>(starter);
  const [design, setDesign] = useState<Design>(defaultDesign);
  const [template, setTemplate] = useState('professional');
  const [tab, setTab] = useState<'editor' | 'templates' | 'designer' | 'ai'>('editor');
  const [jd, setJd] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [aiAction, setAiAction] = useState<AIAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(defaultSectionOrder);

  useEffect(() => {
    const id = requestedId || 'cv-1';
    const raw = localStorage.getItem(`ai-cv-builder-${id}`);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.cv) setCv({ ...starter, ...data.cv, id });
        if (data.design) setDesign({ ...defaultDesign, ...data.design });
        if (data.template) setTemplate(data.template);
        if (Array.isArray(data.sectionOrder)) setSectionOrder(data.sectionOrder);
        setSaveState('saved');
        return;
      } catch {}
    }
    const legacy = localStorage.getItem(LEGACY_DRAFT_KEY);
    if (!requestedId && legacy) {
      try {
        const data = JSON.parse(legacy);
        if (data.cv) setCv({ ...starter, ...data.cv });
        if (data.design) setDesign({ ...defaultDesign, ...data.design });
        if (data.template) setTemplate(data.template);
        if (Array.isArray(data.sectionOrder)) setSectionOrder(data.sectionOrder);
        setSaveState('saved');
        return;
      } catch {}
    }
    setCv(requestedId ? blankCV(id) : starter);
    setDesign(defaultDesign);
    setTemplate('professional');
    setSectionOrder(defaultSectionOrder);
    setSaveState('unsaved');
  }, [requestedId]);

  const selected = useMemo(() => templates.find(t => t.id === template) ?? templates[0], [template]);
  const wordCount = useMemo(() => [cv.summary, ...cv.experience, ...cv.education, ...cv.skills, ...cv.projects].join(' ').trim().split(/\s+/).filter(Boolean).length, [cv]);

  const update = <K extends keyof CV>(key: K, value: CV[K]) => { setCv(prev => ({ ...prev, [key]: value })); setSaveState('unsaved'); };

  function persist(currentCV = cv, currentDesign = design, currentTemplate = template, currentOrder = sectionOrder) {
    const id = currentCV.id || `cv-${Date.now()}`;
    const savedCV = { ...currentCV, id };
    localStorage.setItem(`ai-cv-builder-${id}`, JSON.stringify({ cv: savedCV, design: currentDesign, template: currentTemplate, sectionOrder: currentOrder }));
    const current = readIndex();
    const entry: SavedCV = { id, name: savedCV.name || 'Untitled CV', role: savedCV.role || 'Professional Title', updatedAt: new Date().toISOString() };
    const next = current.some(item => item.id === id) ? current.map(item => item.id === id ? entry : item) : [entry, ...current];
    localStorage.setItem(CV_INDEX_KEY, JSON.stringify(next));
    if (id !== currentCV.id) setCv(savedCV);
  }

  function saveDraft() { setSaveState('saving'); persist(); setSaveState('saved'); }

  useEffect(() => {
    if (saveState !== 'unsaved') return;
    const timer = window.setTimeout(() => { setSaveState('saving'); persist(); setSaveState('saved'); }, 900);
    return () => window.clearTimeout(timer);
  }, [cv, design, template, sectionOrder, saveState]);

  function newCV() {
    const id = `cv-${Date.now()}`;
    const fresh = blankCV(id);
    setCv(fresh); setDesign(defaultDesign); setTemplate('professional'); setSectionOrder(defaultSectionOrder); setSavedTab();
    persist(fresh, defaultDesign, 'professional', defaultSectionOrder);
    router.push(`/?cv=${id}`);
  }

  function setSavedTab() { setSaveState('saved'); setTab('editor'); setAiOutput(''); setAiAction(null); }

  function selectTemplate(id: string) {
    const t = templates.find(x => x.id === id)!;
    setTemplate(id); setDesign(d => ({ ...d, accent: t.accent, columns: t.columns })); setSaveState('unsaved');
  }

  async function askAI(action: AIAction) {
    setBusy(true); setAiAction(action); setAiOutput('Generating a professional suggestion…');
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, cv, jobDescription: jd }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed.');
      setAiOutput(data.text || 'No suggestion returned.');
    } catch (error) {
      setAiOutput(error instanceof Error ? error.message : 'Gemini AI request failed.');
    } finally { setBusy(false); }
  }

  function applyAI() {
    if (!aiOutput || !aiAction) return;
    if (aiAction === 'summary') update('summary', aiOutput);
    if (aiAction === 'experience') update('experience', aiOutput.split('\n').map(x => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean));
  }

  function moveSection(index: number, direction: -1 | 1) {
    const next = [...sectionOrder]; const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSectionOrder(next); setSaveState('unsaved');
  }

  function resetDesign() { setDesign(defaultDesign); setSectionOrder(defaultSectionOrder); setTemplate('professional'); setSaveState('unsaved'); }
  function printCV() { window.print(); }

  const renderSection = (key: SectionKey) => {
    if (key === 'profile') return <ResumeSection key={key} title="PROFILE"><p>{cv.summary || 'Add a professional summary from the editor.'}</p></ResumeSection>;
    if (key === 'experience') return <ResumeSection key={key} title="EXPERIENCE">{cv.experience.length ? cv.experience.map((x,i)=><div className="bullet" key={i}>• {x}</div>) : <p>Add your experience.</p>}</ResumeSection>;
    if (key === 'projects') return <ResumeSection key={key} title="PROJECTS">{cv.projects.length ? cv.projects.map((x,i)=><p key={i}>{x}</p>) : <p>Add relevant projects.</p>}</ResumeSection>;
    if (key === 'skills') return <ResumeSection key={key} title="SKILLS"><div className="chips">{cv.skills.length ? cv.skills.map(x=><span key={x}>{x}</span>) : <span className="placeholder-chip">Add skills</span>}</div></ResumeSection>;
    return <ResumeSection key={key} title="EDUCATION">{cv.education.length ? cv.education.map((x,i)=><p key={i}>{x}</p>) : <p>Add your education.</p>}</ResumeSection>;
  };

  const mainKeys = sectionOrder.filter(key => ['profile', 'experience', 'projects'].includes(key));
  const sideKeys = sectionOrder.filter(key => ['skills', 'education'].includes(key));

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="logo">CV</div><div><strong>AI CV Builder</strong><span>Build. Customize. Get hired.</span></div></div>
      <div className="save-indicator"><span className={`status-dot ${saveState}`}></span>{saveState === 'saving' ? 'Saving…' : saveState === 'unsaved' ? 'Unsaved changes' : 'All changes saved'}</div>
      <div className="top-actions"><button className="ghost" onClick={() => router.push('/dashboard')}><FolderOpen size={16}/> My CVs</button><button className="ghost" onClick={newCV}><Plus size={16}/> New CV</button><button className="ghost" onClick={saveDraft}><Save size={16}/> Save</button><button className="primary" onClick={printCV}><Printer size={16}/> Export PDF</button></div>
    </header>
    <section className="workspace">
      <aside className="sidebar">
        <nav className="tabs">{([['editor','Editor',FileText],['templates','Templates',LayoutTemplate],['designer','Design',Palette],['ai','AI Assistant',Sparkles]] as const).map(([id,label,Icon]) => <button key={id} onClick={() => setTab(id)} className={tab === id ? 'active' : ''}><Icon size={16}/>{label}</button>)}</nav>
        {tab === 'editor' && <div className="panel editor-panel">
          <div className="panel-heading"><div><strong>CV Content</strong><span>Write your details once. The preview updates live.</span></div><span className="word-count">{wordCount} words</span></div>
          <label>Full name<input value={cv.name} onChange={e => update('name', e.target.value)} placeholder="Your name"/></label>
          <label>Professional title<input value={cv.role} onChange={e => update('role', e.target.value)} placeholder="e.g. Software Engineer"/></label>
          <div className="two"><label>Email<input value={cv.email} onChange={e => update('email', e.target.value)} placeholder="you@email.com"/></label><label>Phone<input value={cv.phone} onChange={e => update('phone', e.target.value)} placeholder="+92…"/></label></div>
          <label>Location<input value={cv.location} onChange={e => update('location', e.target.value)} placeholder="City, Country"/></label>
          <SectionEditor title="Professional Summary" value={cv.summary} onChange={v => update('summary', v)} placeholder="2–4 lines describing your strongest professional value…" />
          <SectionEditor title="Experience" value={cv.experience.join('\n')} onChange={v => update('experience', v.split('\n').map(x => x.trim()).filter(Boolean))} placeholder="One achievement per line" />
          <SectionEditor title="Education" value={cv.education.join('\n')} onChange={v => update('education', v.split('\n').map(x => x.trim()).filter(Boolean))} placeholder="Degree — Institution" />
          <SectionEditor title="Skills" value={cv.skills.join(', ')} onChange={v => update('skills', v.split(',').map(x => x.trim()).filter(Boolean))} placeholder="React, TypeScript, SQL…" />
          <SectionEditor title="Projects" value={cv.projects.join('\n')} onChange={v => update('projects', v.split('\n').map(x => x.trim()).filter(Boolean))} placeholder="One project per line" />
        </div>}
        {tab === 'templates' && <div className="template-grid"><div className="panel-heading full"><div><strong>Choose a template</strong><span>Switch layouts without losing your CV content.</span></div></div>{templates.map(t => <button key={t.id} className={`template-card ${template === t.id ? 'selected' : ''}`} onClick={() => selectTemplate(t.id)}><div className="mini-preview" style={{ '--accent': t.accent } as React.CSSProperties}><b></b><i></i><i></i><i></i></div><div className="template-meta"><strong>{t.name}</strong>{template === t.id && <Check size={14}/>}</div><span>{t.description}</span></button>)}<button className="template-card custom" onClick={() => setTab('designer')}><div className="custom-icon">＋</div><strong>Build your template</strong><span>Customize columns, colors, font, spacing and sections.</span></button></div>}
        {tab === 'designer' && <div className="panel"><div className="design-title"><Settings2 size={18}/><div><strong>Template Designer</strong><span>Changes update the preview instantly.</span></div></div><div className="designer-actions"><span>Current: <b>{selected.name}</b></span><button className="text-button" onClick={resetDesign}><RotateCcw size={13}/> Reset</button></div><label>Accent color<input type="color" value={design.accent} onChange={e => { setDesign({ ...design, accent: e.target.value }); setSaveState('unsaved'); }}/></label><label>Font<select value={design.font} onChange={e => { setDesign({ ...design, font: e.target.value }); setSaveState('unsaved'); }}><option>Inter</option><option>Georgia</option><option>Arial</option><option>Verdana</option><option>Times New Roman</option></select></label><label>Text size <b>{design.size}px</b><input type="range" min="9" max="14" value={design.size} onChange={e => { setDesign({ ...design, size: Number(e.target.value) }); setSaveState('unsaved'); }}/></label><label>Section spacing <b>{design.spacing.toFixed(1)}</b><input type="range" min="0.6" max="1.8" step="0.1" value={design.spacing} onChange={e => { setDesign({ ...design, spacing: Number(e.target.value) }); setSaveState('unsaved'); }}/></label><div className="choice"><span>Columns</span><button className={design.columns === 1 ? 'chosen' : ''} onClick={() => { setDesign({ ...design, columns: 1 }); setSaveState('unsaved'); }}>1 column</button><button className={design.columns === 2 ? 'chosen' : ''} onClick={() => { setDesign({ ...design, columns: 2 }); setSaveState('unsaved'); }}>2 columns</button></div><div className="choice"><span>Profile photo</span><button className={design.showAvatar ? 'chosen' : ''} onClick={() => { setDesign({ ...design, showAvatar: !design.showAvatar }); setSaveState('unsaved'); }}>{design.showAvatar ? 'Shown' : 'Hidden'}</button></div><div className="section-order"><strong>Section order</strong>{sectionOrder.map((s, index) => <div key={s}><GripVertical size={14}/><span>{sectionLabels[s]}</span><button disabled={index === 0} onClick={() => moveSection(index, -1)} aria-label={`Move ${sectionLabels[s]} up`}><ArrowUp size={13}/></button><button disabled={index === sectionOrder.length - 1} onClick={() => moveSection(index, 1)} aria-label={`Move ${sectionLabels[s]} down`}><ArrowDown size={13}/></button></div>)}</div></div>}
        {tab === 'ai' && <div className="panel ai-panel"><div className="ai-box"><WandSparkles size={18}/><div><strong>AI CV Assistant</strong><span>Professional wording only — it must not invent your experience.</span></div></div><div className="ai-actions"><button disabled={busy} onClick={() => askAI('summary')} className="ai-btn">Improve summary</button><button disabled={busy} onClick={() => askAI('experience')} className="ai-btn">Rewrite experience</button></div><label>Job description<textarea rows={8} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description here for ATS analysis…"/></label><button disabled={busy} onClick={() => askAI('ats')} className="ai-btn primary-ai">Analyze ATS match</button><div className="ai-result-wrap"><div className="result-head"><strong>{busy ? 'AI is working…' : 'AI result'}</strong>{aiAction && aiAction !== 'ats' && aiOutput && !busy && <button className="text-button" onClick={applyAI}><Check size={13}/> Apply to CV</button>}</div><pre className="ai-result">{aiOutput || 'Your AI suggestions and ATS analysis will appear here.'}</pre></div></div>}
      </aside>
      <section className="preview-area"><div className="preview-toolbar"><div><span className="pill">A4</span><span className="muted">{selected.name} · {design.columns} column</span></div><div><span className="muted">Live preview</span><button className="ghost" onClick={printCV}><Download size={15}/> Export / Print</button></div></div><div className="paper-wrap"><article className={`paper cols-${design.columns}`} style={{ '--accent': design.accent, '--resume-font': design.font, '--resume-size': `${design.size}px`, '--resume-space': design.spacing } as React.CSSProperties}>
        <header className="resume-head"><div><h1>{cv.name || 'Your Name'}</h1><h2>{cv.role || 'Professional Title'}</h2><p className="contact">{[cv.location, cv.phone, cv.email].filter(Boolean).join(' · ') || 'Location · Phone · Email'}</p></div>{design.showAvatar && <div className="avatar">{cv.name ? cv.name.split(' ').map(x => x[0]).slice(0,2).join('') : 'CV'}</div>}</header>
        <div className="resume-columns"><div className="resume-main">{mainKeys.map(renderSection)}</div><div className="resume-side">{sideKeys.map(renderSection)}</div></div>
      </article></div></section>
    </section>
  </main>;
}

function SectionEditor({ title, value, onChange, placeholder }: { title: string; value: string; onChange: (v:string)=>void; placeholder:string }) { return <label><span className="label-row">{title}<small>{value.length} chars</small></span><textarea rows={title === 'Professional Summary' ? 5 : 4} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/></label>; }
function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="resume-section"><h3>{title}</h3>{children}</section>; }
