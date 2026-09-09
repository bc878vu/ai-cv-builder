# AI CV Builder

AI-powered CV builder with reusable CV data, built-in templates, live A4 preview and server-side AI assistance.

## Current foundation
- Next.js App Router + TypeScript
- Live CV editor and A4 preview
- 8 built-in templates
- AI assistant endpoints for summary, experience and ATS analysis
- Job description input for keyword/ATS guidance
- Server-only `OPENAI_API_KEY`

## Run

```bash
npm install
npm run dev
```

Create `.env.local` with:

```env
OPENAI_API_KEY=your_key_here
```

PDF export, persistence/authentication, full drag-and-drop template designer, DOCX/PNG export, and production database/storage are planned as the next implementation layers.
