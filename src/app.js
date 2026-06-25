const path = require("path");
const express = require("express");

const PUBLIC_DIR = path.join(__dirname, "..", "public");

const app = express();
app.use(express.static(PUBLIC_DIR));

app.get("/healthz", (_req, res) => res.json({ ok: true }));

module.exports = { app, PUBLIC_DIR };
