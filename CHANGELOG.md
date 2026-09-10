# Changelog

## 0.8.1 — September 11, 2026

### Dynamic CV editing
- Improved live CV zoom with a 60%–160% range.
- Added persistent drag-and-drop section positioning across the main and side columns.
- Added draggable header identity/photo positioning inside the CV header.
- Added direct contact alignment and header alignment controls.
- Fixed contact/header alignment refresh so saved choices are not overwritten by preview updates.
- Improved the floating editing toolbar for smaller screens.

### A4 print and pagination
- Removed the generated "AI CV BUILDER • PROFESSIONAL RESUME" footer/banner from the CV page.
- Locked print output to a true A4 portrait page width.
- Removed the unbreakable-column print rule that could push content onto an unnecessary blank sheet.
- Kept individual CV sections together where possible while allowing long columns to flow naturally across additional A4 pages.
- Hid editor-only controls and screen chrome during printing.

### Release metadata
- Internal application release is 0.8.1.
- The release number remains internal and is not shown inside the app UI.

## 0.8.0 — September 11, 2026

### Premium CV Studio
- Added a modern visual design layer for the live A4 workspace.
- Added a styled page background, glass panels, polished navigation, cards and preview staging.
- Upgraded CV headers with stronger typography, accent treatments and profile-photo presentation.
- Added a refined CV footer treatment.
- Improved template previews and visual differentiation across the 12 templates.
- Added responsive styling for desktop, tablet and mobile editing.

### Interactive editing
- Added live CV zoom controls from 70% to 140%.
- Added drag-and-drop CV section positioning, including moving sections between the main and side columns.
- Saved custom section placement per CV in the browser.
- Added contact-information alignment controls (left, center, right).
- Added a one-click layout reset.

### Print and A4 pagination
- Removed generated print header content so the CV itself controls its header.
- Added a dedicated A4 print stylesheet.
- Fixed the extra blank print sheet caused by the fixed screen-preview page height.
- Allow content to flow onto additional A4 pages only when the CV actually needs them.
- Kept sections together where possible during pagination.

### Release metadata
- Internal application release is 0.8.0.
- The release number remains internal and is not shown inside the app UI.

## 0.7.0 — September 11, 2026

### Product polish
- Reworked the public pages with more natural, product-focused copy.
- Expanded About, Services, Projects, Profile, Contact, Privacy and Terms content.
- Removed the visible semantic app version from public navigation and About content.
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
