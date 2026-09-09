import type { Metadata } from 'next';
import Link from 'next/link';
import { Github, Globe2, Mail, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react';
import { developer } from '../profile-data';

export const metadata: Metadata = {
  title: 'Asad Amanat Ali — Profile',
  description: 'Profile and software portfolio of Asad Amanat Ali, web developer and software engineering student.',
};

export default function ProfilePage() {
  return (
    <main className="public-page">
      <section className="profile-hero">
        <img className="profile-photo" src={developer.avatar} alt="Asad Amanat Ali" />
        <div><span className="eyebrow">DEVELOPER PROFILE</span><h1>{developer.name}</h1><p className="profile-title">{developer.title}</p><p>{developer.bio}</p><div className="profile-meta"><span><MapPin size={15}/> {developer.location}</span><span><Mail size={15}/> {developer.email}</span><span><MessageCircle size={15}/> {developer.whatsapp}</span></div></div>
      </section>
      <section className="public-grid three">
        <article className="public-card"><Github size={20}/><h2>GitHub</h2><p>Repositories, experiments, product work and learning projects.</p><Link href={developer.github} target="_blank" rel="noreferrer">Open GitHub <ArrowUpRight size={15}/></Link></article>
        <article className="public-card"><Globe2 size={20}/><h2>Vercel</h2><p>Deployment workspace used to ship web projects and prototypes.</p><Link href={developer.vercel} target="_blank" rel="noreferrer">Open Vercel <ArrowUpRight size={15}/></Link></article>
        <article className="public-card"><Mail size={20}/><h2>Direct contact</h2><p>For collaboration, project discussion, feedback or opportunities.</p><Link href={`mailto:${developer.email}`}>Email me <ArrowUpRight size={15}/></Link></article>
      </section>
      <section className="profile-content"><div><span className="eyebrow">FOCUS</span><h2>What I am building</h2><ul><li>Modern responsive web applications with React and Next.js.</li><li>AI-assisted products that keep user data and generated content clearly separated.</li><li>Practical dashboards, management systems and productivity tools.</li><li>Learning cloud deployment, GitHub workflows and production engineering.</li></ul></div><div><span className="eyebrow">AI CV BUILDER</span><h2>Why this product exists</h2><p>AI CV Builder is a hands-on product project for turning a real CV workflow into a polished web application. The goal is to make professional formatting, AI writing, ATS preparation and exporting simple enough for anyone to use.</p><Link className="public-primary" href="/">Start building a CV <ArrowUpRight size={16}/></Link></div></section>
    </main>
  );
}
