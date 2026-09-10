# Changelog

## 0.8.6 — September 11, 2026

### Mobile editor and A4 zoom
- Added dedicated mobile section drag handles so CV content can be reordered with touch without mutating React-owned nodes.
- Added pointer capture, live target detection and visual-order sorting for reliable touch reordering.
- Kept native desktop drag-and-drop support while making mobile interaction separate and safer.
- A4 page now keeps a fixed internal 794×1123 editor coordinate system; zoom uses visual `transform: scale()` instead of layout `zoom`, so text/layout does not reflow when zoom changes.
- Added responsive fit scaling so the full A4 page fits phone width at the base 100% editor zoom, while 60–160% remains available for true page-level zoom.
- Floating controls retain free positioning with pointer capture, viewport clamping, auto-flipping popup placement and Dock.
- Added a fresh layout/floating-position storage key so older interaction state cannot interfere.
- Bumped the service-worker shell cache to v6.

### Release metadata
- Internal application release is 0.8.6.
- The release number remains internal and is not shown inside the app UI.

## 0.8.5 — September 11, 2026

### Free-position floating controls
- Fixed the circular CV control stopping after the first drag movement.
- Replaced the drag listener lifecycle with stable pointer events and pointer capture.
- Added pointer cancel/release handling so mouse, touch and pen dragging remains reliable.
- Floating position is now stored under a fresh key so old broken positions cannot interfere.
- Added visual-viewport-aware clamping for browser resize, mobile keyboards and pinch-zoom scenarios.
- Popup automatically opens on the safe side of the control instead of going off-screen.
- Popup automatically flips below the button when the button is near the top edge.
- Added a one-tap Dock control to snap the button to the nearest viewport edge without removing free positioning.
- Added lightweight requestAnimationFrame throttling during drag for smoother movement.
- Added a new service-worker cache version to prevent stale editor chunks from surviving the fix.

## 0.8.4 — September 11, 2026

### Critical editor stability fix
- Removed direct re-parenting and insertBefore/appendChild mutations from the React-owned CV tree.
- Fixed the Chrome `NotFoundError: Failed to execute 'insertBefore'` crash caused by React reconciliation fighting external DOM moves.
