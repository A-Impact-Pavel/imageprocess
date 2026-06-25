const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const QRCode = require("qrcode");
const { nanoid } = require("nanoid");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Map common image mime types to file extensions.
const EXT_BY_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/bmp": "bmp",
  "image/svg+xml": "svg",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/avif": "avif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || "bin";
    cb(null, `${nanoid()}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("ONLY_IMAGES"));
  },
});

// Resolve the externally-visible base URL, honoring the host's proxy headers.
function baseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${proto}://${host}`;
}

// Find an uploaded file by id (filename without extension).
function findUpload(id) {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return null;
  const files = fs.readdirSync(UPLOAD_DIR);
  const match = files.find((f) => f.slice(0, f.lastIndexOf(".")) === id);
  return match ? path.join(UPLOAD_DIR, match) : null;
}

function page(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<link rel="stylesheet" href="/style.css" />
</head>
<body>
<main class="card">${body}</main>
</body>
</html>`;
}

const app = express();
app.set("trust proxy", true);
app.use(express.static(PUBLIC_DIR));

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.get("/", (_req, res) => {
  res.send(
    page(
      "Image → QR",
      `<h1>Image → QR</h1>
       <p class="sub">Upload an image and get a QR code. Scan it on any phone to download the image.</p>
       <form action="/upload" method="post" enctype="multipart/form-data" id="form">
         <label class="drop" id="drop">
           <input type="file" name="image" accept="image/*" required id="file" hidden />
           <span id="dropText">Tap to choose an image, or drag one here</span>
         </label>
         <button type="submit">Generate QR code</button>
       </form>
       <script src="/upload.js"></script>`
    )
  );
});

app.post("/upload", (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      const msg =
        err.message === "ONLY_IMAGES"
          ? "Please upload an image file."
          : err.code === "LIMIT_FILE_SIZE"
          ? "Image is too large (max 10 MB)."
          : "Upload failed.";
      return res.status(400).send(page("Upload failed", `<h1>Upload failed</h1><p class="sub">${msg}</p><a class="btn" href="/">Try again</a>`));
    }
    if (!req.file) {
      return res
        .status(400)
        .send(page("Upload failed", `<h1>Upload failed</h1><p class="sub">No file was uploaded.</p><a class="btn" href="/">Try again</a>`));
    }

    const id = req.file.filename.slice(0, req.file.filename.lastIndexOf("."));
    const downloadUrl = `${baseUrl(req)}/i/${id}`;
    const qr = await QRCode.toDataURL(downloadUrl, { width: 320, margin: 2 });

    res.send(
      page(
        "Your QR code",
        `<h1>Scan to download</h1>
         <p class="sub">Point your phone camera at this QR code. The image will download.</p>
         <img class="qr" src="${qr}" alt="QR code" width="320" height="320" />
         <p class="link"><a href="${downloadUrl}">${downloadUrl}</a></p>
         <a class="btn" href="/">Upload another</a>`
      )
    );
  });
});

app.get("/i/:id", (req, res) => {
  const filePath = findUpload(req.params.id);
  if (!filePath) {
    return res.status(404).send(page("Not found", `<h1>Not found</h1><p class="sub">That image does not exist.</p><a class="btn" href="/">Go home</a>`));
  }
  res.download(filePath, path.basename(filePath));
});

module.exports = { app, UPLOAD_DIR };
