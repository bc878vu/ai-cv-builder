# AI CV Builder

A professional, responsive CV builder with live A4 preview, customizable templates, profile-photo controls and a server-side Gemini AI writing assistant.

## Current features

- Next.js App Router + TypeScript
- Responsive editor that works across desktop, tablet and mobile
- 8 built-in CV templates with 1/2-column layouts
- Live A4 preview with print/PDF export
- Profile photo upload with client-side compression
- Photo visibility, position (left/right/top/bottom), shape and size controls
- Accent color, font, text size, spacing, columns and section-order controls
- Auto-save and multiple CVs in browser storage
- AI writing settings for tone, length, audience, language and focus
- AI actions: improve summary, rewrite experience, improve skills, tailor to a job, cover letter and ATS analysis
- AI prompts are grounded in the candidate CV and explicitly prohibit fabricated facts
- Server-side Gemini API key handling

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add the server key:

```env
GEMINI_API_KEY=your_key_here
```

Never commit a real API key to Git.

## Architecture

CV content is separated from presentation so one CV can render through multiple templates. The current MVP stores drafts locally for a fast zero-setup experience. The production roadmap adds authentication, database persistence, cloud photo storage, version history and dedicated export services.

## Roadmap

1. Authentication + account dashboard
2. Database-backed CVs and saved custom templates
3. True drag-and-drop template builder
4. Cloud profile-photo storage and crop editor
5. Robust PDF + DOCX + PNG export service
6. Structured AI generation with Accept/Reject/Regenerate
7. Deterministic keyword extraction + ATS scoring layer
8. Cover-letter and job-specific CV workflows
9. Admin template management and marketplace foundation
