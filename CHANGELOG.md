# Changelog

## 0.7.0 — September 11, 2026

### Product polish
- Reworked the public pages with more natural, product-focused copy.
- Expanded About, Services, Projects, Profile, Contact, Privacy and Terms content.
- Added a visible semantic app version in the public navigation.
- Improved dashboard wording and TypeScript typing.

### Security
- Added production security response headers and a Content Security Policy.
- Added request-size and origin checks to public APIs.
- Added lightweight per-client rate limiting for AI requests and public feedback submissions.
- Kept AI credentials server-side and retained Supabase Row Level Security for public feedback.

### Offline & reliability
- Improved the service worker so public pages and static assets can be cached for offline use.
- API requests are deliberately excluded from the offline cache.
- Kept the existing local CV workflow, import/export tools and templates intact.

### Content principles
- Public copy was rewritten to sound straightforward and human rather than promotional or repetitive.
- AI-assisted CV writing continues to be instructed to preserve facts and avoid fabricated claims.

## 0.6.1

Previous stable workspace release with the CV editor, templates, design controls, AI assistant, import/export workflow, public pages and feedback system.
