# Changelog

## 0.9.0 — September 11, 2026

### Admin Control Studio
- Added a dedicated protected `/admin` entry and responsive admin login.
- Added server-signed, HttpOnly admin sessions with configurable `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
- Added Pages & Content CRUD for site content records: create, read, edit, publish/unpublish, search and delete.
- Added public feedback moderation CRUD: read, create, edit and delete reviews.
- Added responsive admin overview with content/page/review statistics.
- Added secure server-only Supabase service-role access for admin CRUD; secrets are never sent to the browser.
- Added a Supabase `site_content` table with timestamps, page/key uniqueness, ordering and publication state.
- Excluded `/admin` and `/api/` from the service-worker cache and bumped shell cache to v9.

### Release metadata
- Internal application release is 0.9.0.
- The release number remains internal and is not shown inside the app UI.

## 0.8.8 — September 11, 2026

### Responsive navigation and profile image
- Hardened public navbar links with active-route semantics, accessible mobile menu state and reliable menu closing after navigation.
- Added responsive navigation sizing/overflow rules for phones, tablets and narrow desktop widths.
- Added a stable GitHub avatar source with an in-app icon fallback so the profile image does not leave a broken image state.
- Updated CSP to permit the stable GitHub avatar redirect source.
- Added responsive viewport-safe styling for the floating popup and resize handles, including dynamic mobile viewport limits, containment and touch-safe hit areas.

## 0.8.7 — September 11, 2026

### Floating controls popup
- Made the CV controls popup independently draggable from its header.
- Added 8-direction edge and corner resize handles for free shrink/extend behavior.
- Popup position and dimensions are persisted locally and restored on the next visit.
- Added viewport-aware minimum/maximum sizing and clamping for desktop, tablet and phone screens.
