# AI CV Builder

AI CV Builder is a modern, responsive CV/resume workspace built by **Asad Amanat Ali**. It combines live A4 editing, professional templates, grounded AI writing, ATS preparation, local CV import, profile-photo controls and PDF/DOCX export.

## Creator

**Asad Amanat Ali** — BS Software Engineering Student · Web Developer · Learning GitHub & Cloud

- GitHub: https://github.com/bc878vu
- Vercel workspace: https://vercel.com/asad2327s-projects
- Email: a.m.a63425@gmail.com
- WhatsApp: 03098851445

The public site includes About, Projects, Profile, Contact, Privacy and Terms pages. The Projects page lists the connected GitHub repositories and clearly marks private repositories.

## Current features

- Next.js App Router + TypeScript
- Responsive editor for desktop, tablet and mobile
- 12 built-in CV templates: Professional, Modern, Minimal, Creative, Executive, Developer, Fresh Graduate, ATS Friendly, Consulting, Academic, Elegant and Bold
- Live A4 preview with automatic multi-page PDF pagination
- PDF export with page numbers
- DOCX export from the rendered CV DOM, preserving computed formatting and profile images where supported by the converter
- Import existing CV files: PDF, DOCX, TXT, Markdown and AI CV Builder JSON backup
- Local PDF.js worker for reliable browser PDF parsing
- Profile photo upload with local compression
- Photo position: left, right, top or bottom
- Photo shape: circle, rounded or square
- Adjustable photo size and visibility
- Accent color, font family, font size, spacing, columns and section ordering
- Professional sections: summary, experience, education, skills, projects, certifications, languages and interests
- Multiple CVs with automatic local saving
- JSON backup/restore for portability
- Offline editor shell through a service worker; CV editing and local workflows continue without the AI server
- AI writing controls for tone, length, audience, language and focus
- AI actions: summary, experience, skills, job tailoring, cover letter and ATS analysis
- AI output is plain CV-ready text with markdown decoration removed before applying it to the CV
- AI instructions prohibit fabricated facts, unsupported skills and invented metrics
- SEO metadata, Open Graph metadata, robots.txt, sitemap and installable web manifest
- Server-side Gemini API key handling
- Stateless AI route with no-store responses so concurrent users' AI requests do not share CV state

## Multi-user behavior

The AI endpoint is request-scoped and stateless: each request contains only the current user's CV/job-description payload, so simultaneous users can call the AI service without one user's prompt being stored in another user's request context. CV drafts are currently browser-local, which means different browsers/devices are isolated without an account database.

For true cross-device accounts, cloud CV persistence, subscriptions and team workspaces, the next production phase should add authentication plus a database-backed user/CV model.

## AI setup

Copy `.env.example` to `.env.local`:

```env
GEMINI_API_KEY=your_key_here
```

Never commit a real API key to Git. AI features require network access; the local editor, stored CVs and export workflows continue to work without the AI service.

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm start
```

## Import notes

Text-based PDFs and DOCX files can be parsed into editable CV fields. Scanned/image-only PDFs require manual entry or OCR because they do not contain machine-readable text. Imported content is always editable before saving or exporting.

## Architecture

CV content is separated from presentation so one CV can render through multiple templates. The current MVP uses browser storage for a fast zero-setup workflow. AI remains server-side so the API key is never shipped to the browser.

## Roadmap

1. Authentication + account dashboard
2. Database-backed CVs and saved custom templates
3. True drag-and-drop template builder
4. Cloud profile-photo storage and crop editor
5. Dedicated PDF/DOCX/PNG export service
6. Structured AI generation with Accept/Reject/Regenerate
7. Deterministic keyword extraction + ATS scoring layer
8. Job-specific CV and cover-letter workflows
9. Admin template management and marketplace foundation
