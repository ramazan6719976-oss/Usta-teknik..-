const express = require("express");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DATA = path.join(ROOT, "data");
const STORE = path.join(DATA, "store.json");
const PORT = process.env.PORT || 3000;

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });

function empty() {
  return {
    parts: [], jobs: [], customers: [], debts: [], entries: [],
    quotes: [], ikinciEl: [], guvenlik: [], updatedAt: 0,
  };
}

function readStore() {
  try {
    if (!fs.existsSync(STORE)) return empty();
    return Object.assign(empty(), JSON.parse(fs.readFileSync(STORE, "utf8")));
  } catch (e) {
    return empty();
  }
}

function writeStore(data) {
  data.updatedAt = Date.now();
  fs.writeFileSync(STORE, JSON.stringify(data));
  return data;
}

const app = express();
app.use(express.json({ limit: "25mb" }));

app.get("/api/data", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readStore());
});

app.post("/api/data", (req, res) => {
  const body = req.body || {};
  const current = readStore();
  // last-write-wins by updatedAt if client sends it
  if ((body.updatedAt || 0) < (current.updatedAt || 0) - 2000) {
    // client slightly older: still accept to avoid stuck, but prefer newer client timestamp
  }
  const saved = writeStore(Object.assign(empty(), body, { updatedAt: Date.now() }));
  res.json({ ok: true, updatedAt: saved.updatedAt });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use(express.static(ROOT, { index: "index.html" }));

app.listen(PORT, () => {
  console.log("Usta Teknik ortak panel http://localhost:" + PORT);
});
