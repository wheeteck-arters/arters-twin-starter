// Finds the passages most related to a question.
import fs from "node:fs";
import { config } from "../config.js";
import { geminiEmbed, tfidfVector, cosine } from "./embed.js";

let cached = null;
export function loadIndex() {
  if (!cached) {
    if (!fs.existsSync(config.paths.index)) throw new Error("No search index yet. Run: npm run index");
    cached = JSON.parse(fs.readFileSync(config.paths.index, "utf8"));
  }
  return cached;
}

export async function search(question, k = 5) {
  const index = loadIndex();
  let scored;
  if (index.method === "gemini" && config.geminiKey) {
    const [q] = await geminiEmbed([question], "RETRIEVAL_QUERY");
    scored = index.chunks.map((c) => ({ ...c, score: cosine(q, c.vector) }));
  } else {
    const q = tfidfVector(question, index.idf);
    scored = index.chunks.map((c) => ({ ...c, score: cosine(q, tfidfVector(c.text, index.idf)) }));
  }
  // Best passage per note, so one long note can't fill every slot.
  const seen = new Set();
  return scored.sort((a, b) => b.score - a.score)
    .filter((c) => !seen.has(c.slug) && seen.add(c.slug))
    .slice(0, k).map(({ vector, ...c }) => c);
}
