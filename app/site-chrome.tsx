'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Mail, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';

const avatar = 'https://avatars.githubusercontent.com/u/270855559?v=4';

export default function SiteChrome() {
  const pathname = usePathname();
  const isEditor = pathname === '/';
  const [open, setOpen] = useState(false);
  const links = [['/about','About'],['/projects','Projects'],['/profile','Profile'],['/contact','Contact'],['/terms','Terms'],['/privacy','Privacy']] as const;

  if (isEditor) return <div className="public-dock" aria-label="AI CV Builder public pages"><Link href="/about">About</Link><Link href="/projects">Projects</Link><Link href="/profile"><img src={avatar} alt=""/> Profile</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link></div>;

  return <header className="public-nav">
    <Link className="public-brand" href="/" aria-label="AI CV Builder home"><span className="public-logo"><span>AI</span><b>CV</b></span><span><b>AI CV Builder</b><small>Build smarter. Get hired.</small></span></Link>
    <nav>{links.map(([href,label])=><Link key={href} className={pathname===href?'active':''} href={href}>{label}</Link>)}<Link className={pathname==='/dashboard'?'active':''} href="/dashboard">My CVs</Link></nav>
    <div className="public-actions"><Link href="https://github.com/bc878vu" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17}/></Link><Link href="mailto:a.m.a63425@gmail.com" aria-label="Email"><Mail size={17}/></Link><Link href="/profile" aria-label="Profile"><UserRound size={17}/></Link><button onClick={()=>setOpen(x=>!x)} aria-label="Open navigation menu" className="mobile-menu">{open?<X size={18}/>:<Menu size={18}/>}</button></div>
    {open&&<div className="mobile-nav">{links.map(([href,label])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}<Link href="/dashboard" onClick={()=>setOpen(false)}>My CVs</Link><Link href="/" onClick={()=>setOpen(false)}>Open Editor</Link></div>}
  </header>;
}
