// npm run index -> chunks every public note and saves data/index.json
// Commit data/index.json: the live site reads it, so Railway needs no build step.
import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { readVault } from "../ingest/note.js";
import { chunkNote } from "./chunk.js";
import { geminiEmbed, buildIdf } from "./embed.js";

const notes = readVault(config.paths.vault).filter((n) => n.public !== false);
const chunks = notes.flatMap(chunkNote);
if (!chunks.length) { console.error("No notes found. Run npm run ingest:sample (or npm run ingest) first."); process.exit(1); }

let method = "keywords";
if (config.geminiKey) {
  try {
    const vectors = await geminiEmbed(chunks.map((c) => c.text));
    chunks.forEach((c, i) => (c.vector = vectors[i]));
    method = "gemini";
  } catch (e) { console.warn(`${e.message}\nFalling back to keyword search.`); }
}
const index = { method, builtAt: new Date().toISOString(), idf: buildIdf(chunks.map((c) => c.text)), chunks };
fs.mkdirSync(path.dirname(config.paths.index), { recursive: true });
fs.writeFileSync(config.paths.index, JSON.stringify(index));
console.log(`Indexed ${chunks.length} passages from ${notes.length} notes using ${method}. Saved data/index.json`);
