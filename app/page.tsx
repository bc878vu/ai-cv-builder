'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Download, FileText, FolderOpen, LayoutTemplate, Palette, Plus, Printer, RotateCcw, Save, Settings2, Sparkles, WandSparkles, X } from 'lucide-react';

type SectionKey = 'profile' | 'experience' | 'education' | 'skills' | 'projects';
type PhotoPosition = 'left' | 'right' | 'top' | 'bottom';
type PhotoShape = 'circle' | 'rounded' | 'square';
type CV = { id: string; name: string; role: string; email: string; phone: string; location: string; summary: string; experience: string[]; education: string[]; skills: string[]; projects: string[]; photo: string };
type Design = { accent: string; font: string; size: number; spacing: number; columns: 1 | 2; radius: number; showAvatar: boolean; photoPosition: PhotoPosition; photoShape: PhotoShape; photoSize: number };
type Template = { id: string; name: string; description: string; accent: string; columns: 1 | 2 };
type SavedCV = { id: string; name: string; role: string; updatedAt: string };
type AIAction = 'summary' | 'experience' | 'skills' | 'tailor' | 'cover-letter' | 'ats';
type WritingSettings = { tone: string; length: string; audience: string; language: string; focus: string };

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

const starter: CV = { id: 'cv-1', name: 'Muhammad Ahmed', role: 'Frontend Developer', email: 'example@email.com', phone: '+92 300 0000000', location: 'Lahore, Pakistan', summary: 'Frontend developer focused on building reliable, accessible and high-performance web experiences with React and Next.js.', experience: ['Built responsive React interfaces used across customer-facing workflows.', 'Improved frontend performance, reusable components and accessibility standards.'], education: ['BS Computer Science — University of Lahore'], skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS'], projects: ['AI CV Builder — designed a template-driven resume editor with AI assistance.'], photo: '' };
const defaultDesign: Design = { accent: '#1d4ed8', font: 'Inter', size: 11, spacing: 1, columns: 1, radius: 6, showAvatar: true, photoPosition: 'right', photoShape: 'circle', photoSize: 78 };
const defaultSectionOrder: SectionKey[] = ['profile', 'experience', 'projects', 'skills', 'education'];
const defaultWriting: WritingSettings = { tone: 'Professional', length: 'Medium', audience: 'Recruiters / ATS', language: 'English', focus: 'Achievements' };
const sectionLabels: Record<SectionKey, string> = { profile: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills', projects: 'Projects' };

function blankCV(id: string): CV { return { ...starter, id, name: '', role: '', summary: '', experience: [], education: [], skills: [], projects: [], photo: '' }; }
function readIndex(): SavedCV[] { try { return JSON.parse(localStorage.getItem(CV_INDEX_KEY) || '[]'); } catch { return []; } }
function clampText(value: string, max: number) { return value.length > max ? value.slice(0, max) : value; }

async function compressPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please select a JPG, PNG or WebP image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Profile photo must be 5 MB or smaller.');
  const source = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')); };
    image.src = url;
  });
  const size = 640;
  const scale = Math.min(1, size / Math.max(source.naturalWidth, source.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not process the image.');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/webp', 0.82);
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get('cv');
  const fileInput = useRef<HTMLInputElement>(null);
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
  const [writing, setWriting] = useState<WritingSettings>(defaultWriting);

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
  const updateDesign = <K extends keyof Design>(key: K, value: Design[K]) => { setDesign(prev => ({ ...prev, [key]: value })); setSaveState('unsaved'); };

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
    const timer = window.setTimeout(() => { setSaveState('saving'); persist(); setSaveState('saved'); }, 700);
    return () => window.clearTimeout(timer);
  }, [cv, design, template, sectionOrder, saveState]);

  function newCV() {
    const id = `cv-${Date.now()}`;
    const fresh = blankCV(id);
    setCv(fresh); setDesign(defaultDesign); setTemplate('professional'); setSectionOrder(defaultSectionOrder); setWriting(defaultWriting); setAiOutput(''); setAiAction(null); setSaveState('saved'); setTab('editor');
    persist(fresh, defaultDesign, 'professional', defaultSectionOrder);
    router.push(`/?cv=${id}`);
  }

  function selectTemplate(id: string) {
    const t = templates.find(x => x.id === id)!;
    setTemplate(id); setDesign(d => ({ ...d, accent: t.accent, columns: t.columns })); setSaveState('unsaved');
  }

  async function askAI(action: AIAction) {
    if (busy) return;
    if ((action === 'ats' || action === 'tailor' || action === 'cover-letter') && jd.trim().length < 30) {
      setAiAction(action); setAiOutput('Please paste a detailed job description (at least 30 characters) so the AI can make a useful, job-specific recommendation.'); return;
    }
    setBusy(true); setAiAction(action); setAiOutput('Generating a professional, CV-grounded result…');
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, cv, jobDescription: jd, writingSettings: writing }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed.');
      setAiOutput(data.text || 'No suggestion returned.');
    } catch (error) {
      setAiOutput(error instanceof Error ? error.message : 'Gemini AI request failed.');
    } finally { setBusy(false); }
  }

  function applyAI() {
    if (!aiOutput || !aiAction) return;
    if (aiAction === 'summary') update('summary', clampText(aiOutput, 1400));
    if (aiAction === 'experience') update('experience', aiOutput.split(/\r?\n/).map(x => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean));
    if (aiAction === 'skills') update('skills', aiOutput.split(/[,\n•]/).map(x => x.trim()).filter(Boolean));
  }

  async function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try { update('photo', await compressPhoto(file)); }
    catch (error) { setAiOutput(error instanceof Error ? error.message : 'Photo upload failed.'); setTab('editor'); }
    event.target.value = '';
  }

  function moveSection(index: number, direction: -1 | 1) {
    const next = [...sectionOrder]; const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSectionOrder(next); setSaveState('unsaved');
  }

  function resetDesign() { setDesign(defaultDesign); setSectionOrder(defaultSectionOrder); setTemplate('professional'); setSaveState('unsaved'); }
  function printCV() { window.print(); }
  function photoNode() {
    const initials = cv.name ? cv.name.split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase() : 'CV';
    return cv.photo ? <img className={`resume-photo photo-${design.photoShape}`} src={cv.photo} alt="Profile" /> : <div className={`avatar photo-${design.photoShape}`}>{initials}</div>;
  }

  const renderSection = (key: SectionKey) => {
    if (key === 'profile') return <ResumeSection key={key} title="PROFILE"><p>{cv.summary || 'Add a professional summary from the editor.'}</p></ResumeSection>;
    if (key === 'experience') return <ResumeSection key={key} title="EXPERIENCE">{cv.experience.length ? cv.experience.map((x,i)=><div className="bullet" key={i}>• {x}</div>) : <p>Add your experience.</p>}</ResumeSection>;
    if (key === 'projects') return <ResumeSection key={key} title="PROJECTS">{cv.projects.length ? cv.projects.map((x,i)=><p key={i}>{x}</p>) : <p>Add relevant projects.</p>}</ResumeSection>;
    if (key === 'skills') return <ResumeSection key={key} title="SKILLS"><div className="chips">{cv.skills.length ? cv.skills.map((x,i)=><span key={`${x}-${i}`}>{x}</span>) : <span className="placeholder-chip">Add skills</span>}</div></ResumeSection>;
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
          <div className="panel-heading"><div><strong>CV Content</strong><span>Write once. Preview updates instantly.</span></div><span className="word-count">{wordCount} words</span></div>
          <div className="photo-card"><div><strong>Profile photo</strong><span>JPG, PNG or WebP · max 5 MB</span></div><div className="photo-actions"><button className="ghost small" onClick={() => fileInput.current?.click()}><Plus size={14}/> {cv.photo ? 'Change photo' : 'Upload photo'}</button>{cv.photo && <button className="ghost small danger" onClick={() => update('photo','')}><X size={14}/> Remove</button>}</div><input ref={fileInput} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoChange}/></div>
          <label>Full name<input value={cv.name} onChange={e => update('name', e.target.value)} placeholder="Your name"/></label>
          <label>Professional title<input value={cv.role} onChange={e => update('role', e.target.value)} placeholder="e.g. Software Engineer"/></label>
          <div className="two"><label>Email<input type="email" value={cv.email} onChange={e => update('email', e.target.value)} placeholder="you@email.com"/></label><label>Phone<input value={cv.phone} onChange={e => update('phone', e.target.value)} placeholder="+92…"/></label></div>
          <label>Location<input value={cv.location} onChange={e => update('location', e.target.value)} placeholder="City, Country"/></label>
          <SectionEditor title="Professional Summary" value={cv.summary} onChange={v => update('summary', v)} placeholder="2–4 lines describing your strongest professional value…" />
          <SectionEditor title="Experience" value={cv.experience.join('\n')} onChange={v => update('experience', v.split(/\r?\n/).map(x => x.trim()).filter(Boolean))} placeholder="One achievement per line" />
          <SectionEditor title="Education" value={cv.education.join('\n')} onChange={v => update('education', v.split(/\r?\n/).map(x => x.trim()).filter(Boolean))} placeholder="Degree — Institution" />
          <SectionEditor title="Skills" value={cv.skills.join(', ')} onChange={v => update('skills', v.split(',').map(x => x.trim()).filter(Boolean))} placeholder="React, TypeScript, SQL…" />
          <SectionEditor title="Projects" value={cv.projects.join('\n')} onChange={v => update('projects', v.split(/\r?\n/).map(x => x.trim()).filter(Boolean))} placeholder="One project per line" />
        </div>}
        {tab === 'templates' && <div className="template-grid"><div className="panel-heading full"><div><strong>Choose a template</strong><span>Switch layouts without losing your CV content.</span></div></div>{templates.map(t => <button key={t.id} className={`template-card ${template === t.id ? 'selected' : ''}`} onClick={() => selectTemplate(t.id)}><div className="mini-preview" style={{ '--accent': t.accent } as React.CSSProperties}><b></b><i></i><i></i><i></i></div><div className="template-meta"><strong>{t.name}</strong>{template === t.id && <Check size={14}/>}</div><span>{t.description}</span></button>)}<button className="template-card custom" onClick={() => setTab('designer')}><div className="custom-icon">＋</div><strong>Build your template</strong><span>Customize colors, typography, photo and section order.</span></button></div>}
        {tab === 'designer' && <div className="panel"><div className="design-title"><Settings2 size={18}/><div><strong>Template Designer</strong><span>Every control updates the A4 preview instantly.</span></div></div><div className="designer-actions"><span>Current: <b>{selected.name}</b></span><button className="text-button" onClick={resetDesign}><RotateCcw size={13}/> Reset</button></div><label>Accent color<input type="color" value={design.accent} onChange={e => updateDesign('accent', e.target.value)}/></label><label>Font<select value={design.font} onChange={e => updateDesign('font', e.target.value)}><option>Inter</option><option>Arial</option><option>Georgia</option><option>Verdana</option><option>Times New Roman</option></select></label><label>Text size <b>{design.size}px</b><input type="range" min="9" max="14" value={design.size} onChange={e => updateDesign('size', Number(e.target.value))}/></label><label>Section spacing <b>{design.spacing.toFixed(1)}</b><input type="range" min="0.6" max="1.8" step="0.1" value={design.spacing} onChange={e => updateDesign('spacing', Number(e.target.value))}/></label><div className="choice"><span>Columns</span><button className={design.columns === 1 ? 'chosen' : ''} onClick={() => updateDesign('columns', 1)}>1 column</button><button className={design.columns === 2 ? 'chosen' : ''} onClick={() => updateDesign('columns', 2)}>2 columns</button></div><div className="choice"><span>Profile photo</span><button className={design.showAvatar ? 'chosen' : ''} onClick={() => updateDesign('showAvatar', !design.showAvatar)}>{design.showAvatar ? 'Shown' : 'Hidden'}</button></div><div className="choice"><span>Photo position</span>{(['left','right','top','bottom'] as PhotoPosition[]).map(position => <button key={position} className={design.photoPosition === position ? 'chosen' : ''} onClick={() => updateDesign('photoPosition', position)}>{position[0].toUpperCase()+position.slice(1)}</button>)}</div><div className="choice"><span>Photo shape</span>{(['circle','rounded','square'] as PhotoShape[]).map(shape => <button key={shape} className={design.photoShape === shape ? 'chosen' : ''} onClick={() => updateDesign('photoShape', shape)}>{shape[0].toUpperCase()+shape.slice(1)}</button>)}</div><label>Photo size <b>{design.photoSize}px</b><input type="range" min="52" max="120" value={design.photoSize} onChange={e => updateDesign('photoSize', Number(e.target.value))}/></label><div className="section-order"><strong>Section order</strong>{sectionOrder.map((s, index) => <div key={s}><span>{sectionLabels[s]}</span><button disabled={index === 0} onClick={() => moveSection(index, -1)} aria-label={`Move ${sectionLabels[s]} up`}>↑</button><button disabled={index === sectionOrder.length - 1} onClick={() => moveSection(index, 1)} aria-label={`Move ${sectionLabels[s]} down`}>↓</button></div>)}</div></div>}
        {tab === 'ai' && <div className="panel ai-panel"><div className="ai-box"><WandSparkles size={18}/><div><strong>AI CV Assistant</strong><span>Professional, ATS-aware writing grounded in your actual CV. It must never invent experience, skills, employers or metrics.</span></div></div><div className="writing-settings"><div className="settings-head"><strong>Writing settings</strong><span>Control how every AI result is written.</span></div><div className="two"><label>Tone<select value={writing.tone} onChange={e => setWriting({...writing,tone:e.target.value})}><option>Professional</option><option>Confident</option><option>Executive</option><option>Concise</option><option>Warm</option></select></label><label>Length<select value={writing.length} onChange={e => setWriting({...writing,length:e.target.value})}><option>Short</option><option>Medium</option><option>Detailed</option></select></label><label>Audience<select value={writing.audience} onChange={e => setWriting({...writing,audience:e.target.value})}><option>Recruiters / ATS</option><option>Hiring Manager</option><option>Executive</option><option>General</option></select></label><label>Language<select value={writing.language} onChange={e => setWriting({...writing,language:e.target.value})}><option>English</option><option>Urdu</option></select></label></div><label>Focus<select value={writing.focus} onChange={e => setWriting({...writing,focus:e.target.value})}><option>Achievements</option><option>Responsibilities</option><option>Leadership</option><option>Technical impact</option><option>ATS keywords</option></select></label></div><div className="ai-actions"><button disabled={busy} onClick={() => askAI('summary')} className="ai-btn">Improve summary</button><button disabled={busy} onClick={() => askAI('experience')} className="ai-btn">Rewrite experience</button><button disabled={busy} onClick={() => askAI('skills')} className="ai-btn">Improve skills</button><button disabled={busy} onClick={() => askAI('tailor')} className="ai-btn">Tailor to job</button><button disabled={busy} onClick={() => askAI('cover-letter')} className="ai-btn">Cover letter</button><button disabled={busy} onClick={() => askAI('ats')} className="ai-btn primary-ai">Analyze ATS match</button></div><label>Job description<textarea rows={8} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the complete job description here…"/></label><div className="ai-result-wrap"><div className="result-head"><strong>{busy ? 'AI is working…' : 'AI result'}</strong>{aiAction && ['summary','experience','skills'].includes(aiAction) && aiOutput && !busy && <button className="text-button" onClick={applyAI}><Check size={13}/> Apply to CV</button>}</div><pre className="ai-result">{aiOutput || 'Your professional AI suggestions, job tailoring and ATS analysis will appear here.'}</pre></div></div>}
      </aside>
      <section className="preview-area"><div className="preview-toolbar"><div><span className="pill">A4</span><span className="muted">{selected.name} · {design.columns} column</span></div><div><span className="muted live-dot">● Live preview</span><button className="ghost" onClick={printCV}><Download size={15}/> Export / Print</button></div></div><div className="paper-wrap"><article className={`paper cols-${design.columns} photo-${design.photoPosition}`} style={{ '--accent': design.accent, '--resume-font': design.font, '--resume-size': `${design.size}px`, '--resume-space': design.spacing, '--photo-size': `${design.photoSize}px` } as React.CSSProperties}>
        {design.showAvatar && design.photoPosition === 'top' && <div className="photo-slot top">{photoNode()}</div>}
        <header className={`resume-head photo-${design.photoPosition}`}>
          {design.showAvatar && design.photoPosition === 'left' && <div className="photo-slot">{photoNode()}</div>}
          <div className="resume-head-copy"><h1>{cv.name || 'Your Name'}</h1><h2>{cv.role || 'Professional Title'}</h2><p className="contact">{[cv.location, cv.phone, cv.email].filter(Boolean).join(' · ') || 'Location · Phone · Email'}</p></div>
          {design.showAvatar && design.photoPosition === 'right' && <div className="photo-slot">{photoNode()}</div>}
        </header>
        {design.showAvatar && design.photoPosition === 'bottom' && <div className="photo-slot bottom">{photoNode()}</div>}
        <div className="resume-columns"><div className="resume-main">{mainKeys.map(renderSection)}</div><div className="resume-side">{sideKeys.map(renderSection)}</div></div>
      </article></div></section>
    </section>
  </main>;
}

function SectionEditor({ title, value, onChange, placeholder }: { title: string; value: string; onChange: (v:string)=>void; placeholder:string }) { return <label><span className="label-row">{title}<small>{value.length} chars</small></span><textarea rows={title === 'Professional Summary' ? 5 : 4} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/></label>; }
function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="resume-section"><h3>{title}</h3>{children}</section>; }
