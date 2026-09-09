import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, FolderGit2, LockKeyhole, Github } from 'lucide-react';
import { projects, repoUrl } from '../profile-data';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore Asad Amanat Ali\'s GitHub projects and software work.',
};

export default function ProjectsPage() {
  return (
    <main className="public-page">
      <section className="public-hero compact">
        <span className="eyebrow"><FolderGit2 size={14}/> PROJECT DIRECTORY</span>
        <h1>Projects, experiments and products.</h1>
        <p>A complete directory of the repositories connected to this profile. Public repositories can be opened directly on GitHub; private projects are shown for portfolio context and remain access-controlled.</p>
      </section>
      <section className="project-grid">
        {projects.map((project) => {
          const isPrivate = project.visibility === 'Private';
          return <article className="project-card" key={project.name}>
            <div className="project-top"><span className="project-icon">{isPrivate ? <LockKeyhole size={18}/> : <Github size={18}/>}</span><span className={isPrivate ? 'private-badge' : 'public-badge'}>{project.visibility}</span></div>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            {isPrivate ? <span className="project-private-note">Private repository · GitHub access required</span> : <Link href={repoUrl(project.name)} target="_blank" rel="noreferrer">Open repository <ArrowUpRight size={15}/></Link>}
          </article>;
        })}
      </section>
      <section className="cta-card"><div><span className="eyebrow">BUILD WITH ME</span><h2>Have an idea or need a web application?</h2><p>Reach out for collaboration, product ideas, front-end work and practical software projects.</p></div><Link className="public-primary" href="/contact">Contact Asad <ArrowUpRight size={16}/></Link></section>
    </main>
  );
}
