# imageprocess

Upload an image, resize it, and download the result. The resizing happens
**entirely in your browser** — the image is never uploaded to any server.

## Features

- Drag & drop or pick an image.
- Resize by **percentage** (e.g. 50%) or by exact **width/height in pixels**
  (with an optional "keep aspect ratio" lock).
- Live preview of the new dimensions before downloading.
- One-click download of the resized image.

Supported formats: JPG, PNG, WebP, GIF. (HEIC from iPhone often can't be decoded
by browsers — convert to JPG/PNG first; the app shows a clear message if so.)

## Run locally

```bash
npm install
npm start
# open http://localhost:3000
```

Run the tests:

```bash
npm test
```

## How it works

The server (Express) only serves static files and a `/healthz` check. All image
work is client-side:

- [public/index.html](public/index.html) — the UI.
- [public/app.js](public/app.js) — loads the image, draws it onto a `<canvas>`
  at the chosen size, and exports a downloadable blob.
- [public/resize-math.js](public/resize-math.js) — pure dimension math
  (percent / pixels / aspect-ratio), shared with the tests.

Because everything runs in the browser, you can also just open the page from any
static host — no backend needed.

## Deploy (optional)

The repo is ready for **Render** (see [`render.yaml`](render.yaml)): connect the
repo, and it serves the static page. Or host `public/` on any static host
(GitHub Pages, Netlify, etc.).

See [the design doc](docs/superpowers/specs/2026-06-25-image-resize-design.md).
