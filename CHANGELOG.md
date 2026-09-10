# Changelog

## 0.8.2 — September 11, 2026

### Responsive editor repair
- Fixed stale saved drag layouts from hiding CV content when switching between one-column and two-column templates.
- Automatically stacks CV sections on narrow screens so content remains visible and usable.
- Re-applies layout safely when the preview changes or the viewport is resized.
- Changed editor zoom from visual transform scaling to layout-aware CSS zoom so the page and surrounding workspace stay synchronized.
- Added extra preview breathing room so floating controls no longer cover the end of CV content.
- Repositioned editor controls above the public navigation dock on smaller screens.

### Release metadata
- Internal application release is 0.8.2.
- The release number remains internal and is not shown inside the app UI.

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

## 0.7.0 — September 11, 2026

Previous 0.7.0 public/security/offline release notes retained in repository history.
