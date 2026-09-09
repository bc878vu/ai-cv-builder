import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageCircle, Github, ArrowUpRight } from 'lucide-react';
import { developer } from '../profile-data';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Asad Amanat Ali by email, WhatsApp or GitHub.',
};

export default function ContactPage() {
  return (
    <main className="public-page">
      <section className="public-hero compact"><span className="eyebrow">GET IN TOUCH</span><h1>Let’s build something useful.</h1><p>For AI CV Builder feedback, collaboration, web development discussions or project ideas, use any of the channels below.</p></section>
      <section className="contact-grid">
        <a className="contact-card" href={`mailto:${developer.email}`}><span className="contact-icon"><Mail size={22}/></span><div><b>Email</b><strong>{developer.email}</strong><span>Best for detailed project discussions.</span></div><ArrowUpRight size={18}/></a>
        <a className="contact-card" href="https://wa.me/923098851445" target="_blank" rel="noreferrer"><span className="contact-icon"><MessageCircle size={22}/></span><div><b>WhatsApp</b><strong>{developer.whatsapp}</strong><span>Quick questions and direct communication.</span></div><ArrowUpRight size={18}/></a>
        <a className="contact-card" href={developer.github} target="_blank" rel="noreferrer"><span className="contact-icon"><Github size={22}/></span><div><b>GitHub</b><strong>bc878vu</strong><span>Projects, source code and collaboration.</span></div><ArrowUpRight size={18}/></a>
      </section>
      <section className="cta-card"><div><span className="eyebrow">AI CV BUILDER</span><h2>Need a professional CV?</h2><p>Open the builder and create, import, customize and export your CV in one workspace.</p></div><Link className="public-primary" href="/">Open Builder <ArrowUpRight size={16}/></Link></section>
    </main>
  );
}
