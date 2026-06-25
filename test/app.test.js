const { test } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const { app } = require("../src/app");

test("GET / serves the resize page", async () => {
  const res = await request(app).get("/");
  assert.strictEqual(res.status, 200);
  assert.match(res.text, /שינוי גודל תמונה/);
});

test("GET /healthz returns ok", async () => {
  const res = await request(app).get("/healthz");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { ok: true });
});

test("static assets are served", async () => {
  const css = await request(app).get("/style.css");
  assert.strictEqual(css.status, 200);
  const js = await request(app).get("/resize-math.js");
  assert.strictEqual(js.status, 200);
});
