# Changelog

## 0.8.4 — September 11, 2026

### Critical editor stability fix
- Removed direct re-parenting and insertBefore/appendChild mutations from the React-owned CV tree.
- Fixed the Chrome `NotFoundError: Failed to execute 'insertBefore'` crash caused by React reconciliation fighting external DOM moves.
- Layout persistence now uses safe CSS ordering instead of moving React-owned nodes behind React's back.
- Header photo/identity ordering is also applied through CSS order.
- Removed the preview MutationObserver that repeatedly re-parented CV content after every React update.
- Narrow-screen and one-column layouts are no longer forced through a stale saved DOM layout.
- Bumped the service-worker cache so older broken editor chunks are invalidated after deployment.

### Floating controls
- Preserved the draggable circular CV controls and responsive popup introduced in 0.8.3.
- Preserved zoom, contact alignment, header alignment, drag mode and reset controls.

### Release metadata
- Internal application release is 0.8.4.
- The release number remains internal and is not shown inside the app UI.

## 0.8.3 — September 11, 2026

### Floating CV controls
- Replaced the wide fixed toolbar with a compact circular control button.
- The round control can be dragged freely around the viewport and remembers its position.
- Click/tap the circle to open or close a modern popup panel.
- Popup controls are responsive and stay clamped inside the viewport after resize.
- Added dedicated zoom, contact alignment, header alignment, drag-mode and reset controls.
- Added touch-friendly pointer dragging and clear visual feedback while moving the control.
- Increased layering and spacing so the floating controls are less likely to cover editor content or the public navigation.

### Release metadata
- Internal application release is 0.8.3.
- The release number remains internal and is not shown inside the app UI.

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
