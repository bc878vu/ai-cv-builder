'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Mail, UserRound } from 'lucide-react';

const avatar = 'https://avatars.githubusercontent.com/u/270855559?v=4';

export default function SiteChrome() {
  const pathname = usePathname();
  const isEditor = pathname === '/';

  if (isEditor) {
    return (
      <div className="public-dock" aria-label="AI CV Builder public pages">
        <Link href="/about">About</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/profile"><img src={avatar} alt="Asad Amanat Ali" /> Profile</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/privacy">Privacy</Link>
      </div>
    );
  }

  return (
    <header className="public-nav">
      <Link className="public-brand" href="/">
        <span className="public-logo">CV</span>
        <span><b>AI CV Builder</b><small>Professional CVs with AI</small></span>
      </Link>
      <nav>
        <Link href="/about">About</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/profile">Profile</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
      <div className="public-actions">
        <Link href="https://github.com/bc878vu" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17}/></Link>
        <Link href="mailto:a.m.a63425@gmail.com" aria-label="Email"><Mail size={17}/></Link>
        <Link href="/profile" aria-label="Profile"><UserRound size={17}/></Link>
      </div>
    </header>
  );
}
