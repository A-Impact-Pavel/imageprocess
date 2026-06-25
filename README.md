# imageprocess

Upload an image, get a QR code. Scan the QR on any phone (iPhone/Android, any
network) and the image downloads.

> A QR code can't hold an image — it's too small. So the app hosts your image at
> a public URL and the QR encodes that link. Scanning opens the link and the
> image downloads.

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

> Note: when running locally, the QR points to your machine's address, so only
> devices on the same network can download. For "any phone anywhere", deploy it
> (below) so the QR points to a public URL.

## Deploy (free, public — works for any phone)

This repo is ready for **Render**:

1. Go to <https://render.com> and sign up (no credit card needed).
2. **New → Web Service → Build and deploy from a Git repository**.
3. Connect this repo (`A-Impact-Pavel/imageprocess`). Render reads
   [`render.yaml`](render.yaml) automatically — runtime Node, build `npm install`,
   start `npm start`, health check `/healthz`.
4. Click **Create**. After it deploys you get a public URL like
   `https://imageprocess.onrender.com`.
5. Open that URL, upload an image, scan the QR with any phone — it downloads.

## How it works

| Route       | Purpose |
|-------------|---------|
| `GET /`     | Upload page (pick or drag an image). |
| `POST /upload` | Saves the file, builds the public link, shows the QR + link. |
| `GET /i/:id`   | Streams the image as a download. The QR points here. |
| `GET /healthz` | Health check. |

## Known limitation

Render's **free tier filesystem is ephemeral**: uploaded files reset on restart
or redeploy, and the service sleeps after ~15 min idle (the first request after
sleep is slow). For permanent storage, add a Render persistent disk or switch
storage to a cloud image host (e.g. Cloudinary).

See [the design doc](docs/superpowers/specs/2026-06-25-image-qr-download-design.md)
for details.
