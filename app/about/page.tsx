import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, Sparkles, WandSparkles } from 'lucide-react';
import { developer } from '../profile-data';

export const metadata: Metadata = {
  title: 'About',
  description: 'About AI CV Builder and its creator Asad Amanat Ali.',
};

export default function AboutPage() {
  return (
    <main className="public-page">
      <section className="public-hero">
        <span className="eyebrow"><Sparkles size={14}/> AI CV BUILDER</span>
        <h1>Build a CV that looks professional and reads like you.</h1>
        <p>AI CV Builder combines a live A4 editor, professional templates, grounded AI writing, ATS analysis, local CV import and polished PDF/DOCX export in one workspace.</p>
        <div className="hero-actions"><Link className="public-primary" href="/">Open CV Builder <ArrowRight size={16}/></Link><Link className="public-secondary" href="/projects">Explore projects</Link></div>
      </section>

      <section className="public-grid three">
        {[
          ['Live A4 editing','Edit your content and see the resume update immediately.'],
          ['Grounded AI','Improve summaries, experience, skills and job targeting without fabricating facts.'],
          ['Professional exports','Prepare A4 PDF and Word documents while keeping your visual structure consistent.'],
        ].map(([title,text]) => <article className="public-card" key={title}><CheckCircle2 size={19}/><h2>{title}</h2><p>{text}</p></article>)}
      </section>

      <section className="creator-card">
        <img src={developer.avatar} alt="Asad Amanat Ali" />
        <div><span className="eyebrow">CREATOR</span><h2>{developer.name}</h2><p className="creator-title">{developer.title}</p><p>{developer.bio}</p><div className="hero-actions"><Link className="public-secondary" href="/profile">View profile</Link><Link className="public-secondary" href="/contact">Contact</Link></div></div>
      </section>

      <section className="feature-strip">
        <div><FileText size={20}/><b>12+ built-in templates</b><span>Professional, modern, ATS, executive, developer and more.</span></div>
        <div><WandSparkles size={20}/><b>AI CV assistant</b><span>Plain CV-ready output with no markdown decoration.</span></div>
        <div><Sparkles size={20}/><b>Responsive workspace</b><span>Designed for desktop, tablet and mobile screens.</span></div>
      </section>
    </main>
  );
}
