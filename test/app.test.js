const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const request = require("supertest");
const { app, UPLOAD_DIR } = require("../src/app");

// A tiny valid 1x1 PNG.
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/IcuAAAAAElFTkSuQmCC",
  "base64"
);

test("POST /upload with a valid image returns a QR and the file is retrievable", async () => {
  const res = await request(app)
    .post("/upload")
    .attach("image", PNG_1x1, { filename: "pixel.png", contentType: "image/png" });

  assert.strictEqual(res.status, 200);
  assert.match(res.text, /data:image\/png;base64,/); // QR data-url present

  const m = res.text.match(/\/i\/([A-Za-z0-9_-]+)/);
  assert.ok(m, "result page should contain a /i/<id> link");
  const id = m[1];

  const dl = await request(app).get(`/i/${id}`);
  assert.strictEqual(dl.status, 200);
  assert.match(dl.headers["content-disposition"], /attachment/);

  // cleanup
  const files = fs.readdirSync(UPLOAD_DIR).filter((f) => f.startsWith(id));
  files.forEach((f) => fs.unlinkSync(`${UPLOAD_DIR}/${f}`));
});

test("GET /i/:id for an unknown id returns 404", async () => {
  const res = await request(app).get("/i/does-not-exist-123");
  assert.strictEqual(res.status, 404);
});

test("POST /upload with a non-image is rejected", async () => {
  const res = await request(app)
    .post("/upload")
    .attach("image", Buffer.from("hello"), { filename: "note.txt", contentType: "text/plain" });

  assert.strictEqual(res.status, 400);
});

test("GET /healthz returns ok", async () => {
  const res = await request(app).get("/healthz");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { ok: true });
});
