# Image → QR Download App — Design

**Date:** 2026-06-25
**Status:** Approved

## Goal

A basic web app where a user uploads an image and gets a QR code. Any phone
(iPhone/Android, any network) that scans the QR downloads the image.

## Key constraint

A QR code cannot hold an image (max ~3 KB). The QR must encode a **public URL**
that points to the hosted image. The app hosts the image itself (self-hosted,
full deploy) and serves it via a download URL.

## Stack & platform

- **Node.js + Express** — minimal server.
- **Render** free web service — auto-deploys from the public GitHub repo.
- Libraries: `express`, `multer` (uploads), `qrcode` (QR PNG/data-URL),
  `nanoid` (short ids).

## Routes

| Method | Path        | Purpose |
|--------|-------------|---------|
| GET    | `/`         | Upload page (file picker / drag-drop). |
| POST   | `/upload`   | Save file, mint id, build public URL, render result page with QR + link. |
| GET    | `/i/:id`    | Stream the image with `Content-Disposition: attachment` (forces download). QR points here. |
| GET    | `/healthz`  | Health check for the host. |

## Data flow

1. User uploads an image on `/`.
2. Server stores it at `uploads/<id>.<ext>` and mints a short `<id>`.
3. Server builds `<proto>://<host>/i/<id>` from request headers
   (honors `x-forwarded-proto` behind Render's proxy).
4. Server generates a QR data-URL for that link and renders the result page.
5. Phone scans → `GET /i/:id` → server streams the file as an attachment → download.

## Validation & errors

- Accept only `image/*` mime types; reject others with a clear message.
- Max upload size: 10 MB.
- Unknown id → 404.
- Missing file on upload → 400 with friendly message.

## Testing

Automated (supertest):
- `POST /upload` with a valid image → 200, response contains an id; the file is
  then retrievable at `/i/:id`.
- `GET /i/:id` for an unknown id → 404.
- `POST /upload` with a non-image → 400.

## Known limitation (documented in README)

Render's free tier filesystem is ephemeral: uploaded files reset on restart or
redeploy, and the service sleeps after ~15 min idle (first request after sleep
is slow). Upgrade path: add a Render persistent disk, or swap storage to a
cloud object/image host (e.g. Cloudinary). Not implemented now (YAGNI).
