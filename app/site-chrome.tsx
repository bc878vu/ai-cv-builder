'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Mail, Menu, UserRound, X, Star } from 'lucide-react';
import { useState } from 'react';

const avatar = 'https://github.com/bc878vu.png?size=512';

function ProfileAvatar({ className = '' }: { className?: string }) {
  const [src, setSrc] = useState(avatar);
  return <img className={className} src={src} alt="Asad Amanat Ali" width={40} height={40} loading="eager" decoding="async" referrerPolicy="no-referrer" onError={() => setSrc('/icon.svg')} />;
}

export default function SiteChrome() {
  const pathname = usePathname();
  const isEditor = pathname === '/';
  const [open, setOpen] = useState(false);
  const links = [['/about','About'],['/services','Services'],['/projects','Projects'],['/profile','Profile'],['/contact','Contact'],['/feedback','Feedback'],['/terms','Terms'],['/privacy','Privacy']] as const;
  const closeMenu = () => setOpen(false);

  if (isEditor) return (
    <div className="public-dock" aria-label="AI CV Builder public pages">
      <Link href="/about">About</Link><Link href="/services">Services</Link><Link href="/projects">Projects</Link>
      <Link href="/profile"><ProfileAvatar /> Profile</Link><Link href="/feedback"><Star size={12}/> Feedback</Link><Link href="/contact">Contact</Link>
    </div>
  );

  return <header className="public-nav">
    <Link className="public-brand" href="/" aria-label="AI CV Builder home" onClick={closeMenu}>
      <span className="public-logo"><span>AI</span><b>CV</b></span><span><b>AI CV Builder</b><small>Build smarter. Get hired.</small></span>
    </Link>
    <nav aria-label="Primary navigation">{links.map(([href,label])=><Link key={href} className={pathname===href?'active':''} aria-current={pathname===href?'page':undefined} href={href}>{label}</Link>)}<Link className={pathname==='/dashboard'?'active':''} aria-current={pathname==='/dashboard'?'page':undefined} href="/dashboard">My CVs</Link></nav>
    <div className="public-actions">
      <Link href="https://github.com/bc878vu" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17}/></Link>
      <Link href="mailto:a.m.a63425@gmail.com" aria-label="Email"><Mail size={17}/></Link>
      <Link href="/profile" aria-label="Profile" onClick={closeMenu}><UserRound size={17}/></Link>
      <button type="button" onClick={()=>setOpen(x=>!x)} aria-expanded={open} aria-controls="mobile-public-nav" aria-label={open?'Close navigation menu':'Open navigation menu'} className="mobile-menu">{open?<X size={18}/>:<Menu size={18}/>}</button>
    </div>
    {open&&<div id="mobile-public-nav" className="mobile-nav" role="navigation" aria-label="Mobile navigation">{links.map(([href,label])=><Link key={href} href={href} onClick={closeMenu}>{label}</Link>)}<Link href="/dashboard" onClick={closeMenu}>My CVs</Link><Link href="/" onClick={closeMenu}>Open Editor</Link></div>}
  </header>;
}
