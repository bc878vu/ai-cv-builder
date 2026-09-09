import type { Metadata } from 'next';
import Link from 'next/link';
import { Github, Globe2, Mail, MapPin, MessageCircle, ArrowUpRight, BriefcaseBusiness, Star } from 'lucide-react';
import { developer, services } from '../profile-data';

export const metadata: Metadata = {
  title: 'Asad Amanat Ali — Profile',
  description: 'Profile, services and software portfolio of Asad Amanat Ali, web developer and AI solutions builder.',
};

export default function ProfilePage() {
  return (
    <main className="public-page">
      <section className="profile-hero">
        <img className="profile-photo" src={developer.avatar} alt="Asad Amanat Ali" />
        <div>
          <span className="eyebrow">DEVELOPER PROFILE</span>
          <h1>{developer.name}</h1>
          <p className="profile-title">{developer.title}</p>
          <p>{developer.bio}</p>
          <div className="profile-meta"><span><MapPin size={15}/> {developer.location}</span><span><Mail size={15}/> {developer.email}</span><span><MessageCircle size={15}/> {developer.whatsapp}</span></div>
        </div>
      </section>

      <section className="public-grid three">
        <article className="public-card"><Github size={20}/><h2>GitHub</h2><p>Repositories, experiments, product work and source code.</p><Link href={developer.github} target="_blank" rel="noreferrer">Open GitHub <ArrowUpRight size={15}/></Link></article>
        <article className="public-card"><Globe2 size={20}/><h2>Vercel</h2><p>Deployment workspace used to ship web projects and prototypes.</p><Link href={developer.vercel} target="_blank" rel="noreferrer">Open Vercel <ArrowUpRight size={15}/></Link></article>
        <article className="public-card"><Mail size={20}/><h2>Direct contact</h2><p>For websites, software, AI products, collaboration or project discussions.</p><Link href="/contact">Contact me <ArrowUpRight size={15}/></Link></article>
      </section>

      <section className="profile-content">
        <div><span className="eyebrow">SERVICES</span><h2>Need a website or software?</h2><p>If you need a website of any type, a custom software application, an AI-powered product or improvements to an existing project, you can contact me with your requirements.</p><Link className="public-primary" href="/services">View services <ArrowUpRight size={16}/></Link></div>
        <div><span className="eyebrow">FEEDBACK</span><h2>Share your experience</h2><p>Users can leave a rating and review for AI CV Builder. Public reviews are shown on the feedback page so visitors can see community experiences.</p><Link className="public-primary" href="/feedback"><Star size={16}/> Give feedback</Link></div>
      </section>

      <section className="public-section-heading"><span className="eyebrow">WHAT I CAN BUILD</span><h2>Websites, software and AI products</h2></section>
      <section className="public-grid three service-mini-grid">{services.slice(0, 6).map((service) => <article className="public-card" key={service.title}><BriefcaseBusiness size={20}/><h2>{service.title}</h2><p>{service.description}</p></article>)}</section>
    </main>
  );
}
