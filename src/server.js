// npm run dev  -> http://localhost:3000
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { config, ROOT } from "./config.js";
import { readVault } from "./ingest/note.js";
import { askTwin } from "./twin/ask.js";
import { checkLimits, usageToday } from "./site/limits.js";
import { homePage, postPage, privacyPage, notFound } from "./site/pages.js";

export const app = express();
app.set("trust proxy", 1); // Railway sits behind a proxy
app.use(express.json({ limit: "4kb" }));
app.use(express.static(path.join(ROOT, "public")));

const publicNotes = () => readVault(config.paths.vault).filter((n) => n.public !== false);
const aboutFile = path.join(ROOT, "vault", "about.md");

app.get("/", (req, res) => res.send(homePage(publicNotes(), fs.existsSync(aboutFile) ? fs.readFileSync(aboutFile, "utf8") : "")));
app.get("/posts/:slug", (req, res) => {
  const note = publicNotes().find((n) => n.slug === req.params.slug);
  note ? res.send(postPage(note)) : res.status(404).send(notFound());
});
app.get("/privacy", (req, res) => res.send(privacyPage()));
app.get("/health", (req, res) => res.json({ ok: true, ...usageToday() }));

app.post("/api/ask", async (req, res) => {
  const limit = checkLimits(req.ip);
  if (!limit.ok) return res.status(limit.status).json({ answer: limit.reply, sources: [] });
  const started = Date.now();
  try {
    const result = await askTwin(req.body?.question);
    // Basic log: no question text, no IP.
    console.log(JSON.stringify({ at: new Date().toISOString(), event: "ask", ms: Date.now() - started, refused: result.refused || null, sources: result.sources.length }));
    res.json({ answer: result.answer, sources: result.sources });
  } catch (e) {
    console.error(JSON.stringify({ at: new Date().toISOString(), event: "ask_error", error: e.message }));
    res.status(500).json({ answer: "Something went wrong on my side. Please try again later.", sources: [] });
  }
});

app.use((req, res) => res.status(404).send(notFound()));

if (process.argv[1] && path.resolve(process.argv[1]) === path.join(ROOT, "src", "server.js")) {
  app.listen(config.port, () => console.log(`Site running at http://localhost:${config.port}`));
}
