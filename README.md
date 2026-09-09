# AI CV Builder

A template-driven CV builder with live A4 preview, customizable design controls and server-side AI assistance.

## Implemented
- Next.js App Router + TypeScript
- Responsive CV editor for profile, experience, education, skills and projects
- 8 built-in CV templates
- Live A4 rendering with 1/2-column layouts
- Template Designer: accent color, font, text size, spacing, columns and profile photo visibility
- Local draft persistence in browser storage
- Print-friendly A4 export flow
- AI assistant for summary improvement, experience rewriting and ATS/job-description analysis
- Server-side `OPENAI_API_KEY` handling

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add your server key:

```env
OPENAI_API_KEY=your_key_here
```

## Architecture direction

The application is intentionally template-driven: CV content is separate from presentation so the same CV can render through multiple templates. The next production layer will move drafts/templates to a database, add authentication, file storage and version history, then add true drag-and-drop section ordering and export services.

## Roadmap

1. Authentication + user dashboard
2. Database-backed multiple CVs and saved custom templates
3. Drag-and-drop template builder
4. Profile photo/file storage
5. Robust PDF + DOCX + PNG export
6. Structured AI generation with Accept/Reject/Regenerate
7. Job-description keyword matching + ATS scoring
8. Cover-letter generator and job-specific CV tailoring
9. Admin template management and template marketplace foundation
