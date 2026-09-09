import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, MessageCircle, Mail } from 'lucide-react';
import { developer, services } from '../profile-data';

export const metadata: Metadata = {
  title: 'Web & Software Services',
  description: 'Request a website, custom software, AI application, dashboard, automation workflow or improvements to an existing project.',
};

export default function ServicesPage() {
  return (
    <main className="public-page">
      <section className="public-hero compact"><span className="eyebrow">WEB · SOFTWARE · AI</span><h1>Need a website or software built?</h1><p>Tell me what you need. Websites of any type, custom software, dashboards, AI-powered applications and improvements to existing projects are welcome.</p><div className="hero-actions"><Link className="public-primary" href="/contact">Discuss your project <ArrowUpRight size={16}/></Link><Link className="public-secondary" href="/feedback">See feedback <ArrowUpRight size={16}/></Link></div></section>
      <section className="public-grid three service-grid">{services.map((service) => <article className="public-card" key={service.title}><CheckCircle2 size={20}/><h2>{service.title}</h2><p>{service.description}</p></article>)}</section>
      <section className="cta-card"><div><span className="eyebrow">START A PROJECT</span><h2>Have a different idea?</h2><p>Send the requirements, reference website, screenshots or a short description. We can discuss the scope and the best approach.</p></div><div className="hero-actions"><a className="public-primary" href={`mailto:${developer.email}`}><Mail size={16}/> Email</a><a className="public-secondary" href="https://wa.me/923098851445" target="_blank" rel="noreferrer"><MessageCircle size={16}/> WhatsApp</a></div></section>
    </main>
  );
}
