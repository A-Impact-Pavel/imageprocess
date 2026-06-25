# Image Resize App — Design

**Date:** 2026-06-25
**Status:** Approved (supersedes the earlier image→QR design)

## Goal

Upload an image, choose a new size, and download the resized image. The QR-code
feature from v1 is removed.

## Approach

**Client-side resizing in the browser** using HTML `<canvas>`. The image is
never sent to a server — it is read locally, drawn onto a canvas at the target
size, and exported as a downloadable blob. Fast, private, works offline.

The Express server only serves static files plus a `/healthz` check (kept so the
app can still be deployed on Render).

## Size selection

Two modes (both requested):

1. **Percentage** — scale both dimensions by a percentage (slider, default 50%).
2. **Pixels** — enter width and/or height. A "keep aspect ratio" checkbox
   (default on) derives the missing dimension from the original ratio; when both
   are given with the lock on, width wins. With the lock off, width and height
   are used exactly.

## Components

| File | Responsibility |
|------|----------------|
| `public/index.html` | UI: drop zone, preview, mode controls, buttons. |
| `public/resize-math.js` | Pure `computeDimensions(origW, origH, opts)` — no DOM. Shared with tests. |
| `public/app.js` | File loading, live preview, canvas render, download. |
| `src/app.js` | Express static server + `/healthz`. |
| `src/server.js` | Listen on `PORT`. |

## Output format

Mirror the input where browsers support encoding it: PNG→PNG, WebP→WebP,
everything else→JPEG (quality 0.92). Download filename:
`<name>-<w>x<h>.<ext>`.

## Validation & errors

- Non-image file → friendly message.
- Unsupported/undecodable image (e.g. HEIC) → message suggesting JPG/PNG/WebP.
- Pixel mode without aspect lock requires both width and height.
- All dimensions clamped to a minimum of 1px.

## Testing

- `resize-math.test.js` — exhaustive unit tests of the dimension math
  (percent, pixels with/without aspect lock, clamping, invalid inputs).
- `app.test.js` — server serves the page, static assets, and `/healthz`.

Canvas rendering itself is standard browser API and verified manually in the
browser.
