# AI CV Builder

A fast, responsive, offline-capable CV/resume editor with live A4 preview, professional templates, profile-photo controls, local CV import, PDF/Word export and a server-side Gemini AI writing assistant.

## Current features

- Next.js App Router + TypeScript
- Responsive editor for desktop, tablet and mobile
- 12 built-in CV templates: Professional, Modern, Minimal, Creative, Executive, Developer, Fresh Graduate, ATS Friendly, Consulting, Academic, Elegant and Bold
- Live A4 preview with print-to-PDF export
- DOCX export directly in the browser
- Import existing CV files: PDF, DOCX, TXT, Markdown and AI CV Builder JSON backup
- Profile photo upload with local compression
- Photo position: left, right, top or bottom
- Photo shape: circle, rounded or square
- Adjustable photo size and visibility
- Accent color, font family, font size, spacing, columns and section ordering
- Professional sections: summary, experience, education, skills, projects, certifications, languages and interests
- Multiple CVs with automatic local saving
- JSON backup/restore for portability
- Offline editor shell through a service worker; CV editing and local export do not require the AI server
- AI writing controls for tone, length, audience, language and focus
- AI actions: summary, experience, skills, job tailoring, cover letter and ATS analysis
- AI output is plain CV-ready text with markdown decoration removed before applying it to the CV
- AI instructions prohibit fabricated facts, unsupported skills and invented metrics
- SEO metadata, Open Graph metadata, robots.txt, sitemap and installable web manifest
- Server-side Gemini API key handling

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
